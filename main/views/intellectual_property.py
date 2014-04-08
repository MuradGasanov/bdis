# -*- coding: utf-8 -*-

from django.shortcuts import HttpResponse
import main.models as models
import json
from main.additionally.common import *
from django.db.models import Q

__author__ = 'murad'


class IntellectualProperty():
    def __init__(self):
        pass

    @staticmethod
    def prepare_response(intellectual_properties):
        items = []

        for i_p in intellectual_properties:
            items.append({
                "intellectual_property_id": i_p.intellectual_property_id,
                "code": i_p.code,
                "name": i_p.name,
                "doc_type": {"doc_type_id": i_p.doc_type.doc_type_id if i_p.doc_type else None,
                             "name": i_p.doc_type.name if i_p.doc_type else None},
                "direction": {"direction_id": i_p.direction.direction_id if i_p.direction else None,
                              "name": i_p.direction.name if i_p.direction else None},
                "start_date": date_converter(i_p.start_date),
                "public_date": date_converter(i_p.public_date),
                "end_date": date_converter(i_p.end_date),
                "authors": ", ".join([str(a) for a in i_p.authors.all()]),
                "authors_id": list(i_p.authors.all().values_list("author_id", flat=True)),
                "tags": ", ".join(i_p.tags.all().values_list("name", flat=True)),
                "tags_id": list(i_p.tags.all().values_list("tag_id", flat=True))
            })

        return items

    @staticmethod
    def read(request):
        """
        вывод списка интеллектуальной собственности
        """
        # intellectual_properties = list(
        #     models.IntellectualProperty.objects.all().
        #     values("intellectual_property_id", "name", "code",
        #            "doc_type", "direction",
        #            "start_date", "public_date", "end_date")
        # )
        # for item in intellectual_properties:
        #     try:
        #         doc_type = models.DocumentTypes.objects.get(doc_type_id=item["doc_type"])
        #         item["doc_type"] = {"doc_type_id": doc_type.doc_type_id if doc_type else "",
        #                             "name": doc_type.name if doc_type else ""}
        #     except models.DocumentTypes.DoesNotExist:
        #         item["doc_type"] = {"doc_type_id": "", "name": ""}
        #     try:
        #         direction = models.Directions.objects.get(direction_id=item["direction"])
        #         item["direction"] = {"direction_id": direction.direction_id if direction else "",
        #                              "name": direction.name if direction else ""}
        #     except models.Directions.DoesNotExist:
        #         item["direction"] = {"direction_id": "", "name": ""}
        #     item["start_date"] = date_converter(item["start_date"])
        #     item["public_date"] = date_converter(item["public_date"])
        #     item["end_date"] = date_converter(item["end_date"])
        #
        #     authors = list(
        #         models.Authors.objects.
        #         filter(intellectualproperty=int(item["intellectual_property_id"])).
        #         values("author_id", "name", "surname", "patronymic")
        #     )
        #     item["authors"] = [{"author_id": a["author_id"],
        #                         "name": "%s %s %s" % (estr(a["surname"]), estr(a["name"]), estr(a["patronymic"]))}
        #                        for a in authors]
        #     tags = list(
        #         models.Tags.objects.all().
        #         filter(intellectualproperty=int(item["intellectual_property_id"])).
        #         values("tag_id", "name")
        #     )
        #     item["tags"] = [{"tag_id": t["tag_id"],
        #                      "name": t["name"]}
        #                     for t in tags]
        #
        # if intellectual_properties:
        #     return HttpResponse(json.dumps(intellectual_properties), content_type="application/json")
        # else:
        #     return HttpResponse(json.dumps(""), content_type="application/json")

        # intellectual_properties = list(models.IntellectualProperty.objects.all().values("name", "code"))
        # if intellectual_properties:
        #     return HttpResponse(json.dumps(intellectual_properties), content_type="application/json")
        # else:
        #     return HttpResponse(json.dumps(""), content_type="application/json")

        options = None
        if "options" in request.POST:
            options = json.loads(request.POST.get("options"))
        intellectual_properties = models.IntellectualProperty.objects.filter(user=request.user.id, is_active=True)
        total = intellectual_properties.count()
        if options:
            skip = options.get("skip", None)
            take = options.get("take", None)
            filters = options.get("filters", None)
            if filters:

                intellectual_properties = intellectual_properties.filter(
                    reduce(lambda x, y: x & y, [Q(**{
                        f.get("field", "")+"__icontains": f.get("value", "")
                    }) for f in filters])
                ).distinct()

                total = intellectual_properties.count()

                intellectual_properties = intellectual_properties[skip:skip + take]

            intellectual_properties = intellectual_properties[skip:skip + take]

        items = IntellectualProperty.prepare_response(intellectual_properties)
        if items:
            return HttpResponse(json.dumps({"items": items, "total": total}), content_type="application/json")
        else:
            return HttpResponse(json.dumps({"items": [], "total": 0}), content_type="application/json")

    @staticmethod
    def destroy(request):
        """
        удаление интеллектуальной собственнсоти
        """
        item = json.loads(request.POST.get("item"))
        # models.IntellectualProperty.objects.get(
        #     intellectual_property_id=int(item["intellectual_property_id"])).delete()
        ip = models.IntellectualProperty.objects.get(
            intellectual_property_id=int(item["intellectual_property_id"]))
        ip.is_active = False
        ip.save()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def create(request):
        """
        добавление
        """
        item = json.loads(request.POST.get("item"))
        doc_type = item["doc_type"]
        if type(doc_type) == unicode and len(doc_type) != 0:
            doc_type = models.DocumentTypes.objects.create(name=doc_type)
        elif type(doc_type) == int:
            doc_type = try_get(models.DocumentTypes, doc_type_id=doc_type)
        else:
            doc_type = None

        direction = item["direction"]
        if type(direction) == unicode and len(direction) != 0:
            direction = models.Directions.objects.create(name=direction)
        elif type(direction) == int:
            direction = try_get(models.Directions, direction_id=direction)
        else:
            direction = None

        tags = []
        for t in item["tags"]:
            try:
                tag, created = models.Tags.objects.get_or_create(name=t)
            except:
                tag = None
            if tag:
                tags.append(tag)

        new_intellectual_property = models.IntellectualProperty.objects.create(
            name=item["name"],
            code=item["code"],
            is_active=True,
            start_date=date_parser(item["start_date"]),
            public_date=date_parser(item["public_date"]),
            end_date=date_parser(item["end_date"]),
            doc_type=doc_type,
            direction=direction,
            user=request.user)
        new_intellectual_property.authors.add(*item["authors"])

        new_intellectual_property.tags.add(*tags)

        items = IntellectualProperty.prepare_response([new_intellectual_property])

        return HttpResponse(json.dumps(items[0]), content_type="application/json")

    @staticmethod
    def update(request):
        """
        редактирование
        """
        item = json.loads(request.POST.get("item"))

        intellectual_property = models.IntellectualProperty. \
            objects.get(intellectual_property_id=item["intellectual_property_id"])

        current_doc_type = intellectual_property.doc_type
        doc_type = item["doc_type"]
        if type(doc_type) == int:  # doc_type - id записи в таблице
            doc_type = try_get(models.DocumentTypes, doc_type_id=int(doc_type))
        elif type(doc_type) == unicode and len(doc_type) != 0:  # doc_type - название нового типа документа
            doc_type = models.DocumentTypes.objects.create(name=doc_type)
        else:
            doc_type = None

        if current_doc_type and (doc_type != current_doc_type):
            other_with_current_doc_type = models.IntellectualProperty.objects.exclude(
                intellectual_property_id=intellectual_property.intellectual_property_id
            ).filter(
                doc_type=current_doc_type.doc_type_id
            )
            if not other_with_current_doc_type:
                current_doc_type.delete()

        current_direction = intellectual_property.direction
        direction = item["direction"]
        if type(direction) == int:
            direction = try_get(models.Directions, direction_id=direction)
        elif type(direction) == unicode and len(direction) != 0:
            direction = models.Directions.objects.create(name=direction)
        else:
            direction = None

        if current_direction and (direction != current_direction):
            other_with_current_direction = models.IntellectualProperty.objects.exclude(
                intellectual_property_id=intellectual_property.intellectual_property_id
            ).filter(
                direction=current_direction.direction_id
            )
            if not other_with_current_direction:
                current_direction.delete()

        tags = []
        for t in item["tags"]:
            try:
                tag, created = models.Tags.objects.get_or_create(name=t)
            except:
                tag = None
            if tag:
                tags.append(tag)

        intellectual_property.name = item["name"]
        intellectual_property.code = item["code"]
        intellectual_property.doc_type = doc_type
        intellectual_property.direction = direction
        intellectual_property.start_date = date_parser(item["start_date"])
        intellectual_property.public_date = date_parser(item["public_date"])
        intellectual_property.end_date = date_parser(item["end_date"])
        intellectual_property.save()
        intellectual_property.authors.clear()
        intellectual_property.authors.add(*item["authors"])
        intellectual_property.tags.clear()
        intellectual_property.tags.add(*tags)

        items = IntellectualProperty.prepare_response([intellectual_property])

        return HttpResponse(json.dumps(items[0]), content_type="application/json")