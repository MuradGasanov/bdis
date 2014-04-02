# -*- coding: utf-8 -*-

from django.shortcuts import HttpResponse
import main.models as models
import json
from main.additionally.common import *
from django.db.models import Q
from itertools import chain

__author__ = 'murad'


class Search():
    def __init__(self):
        pass

    @staticmethod
    def tree_data_source(request):
        """
        Данные для отображения в дереве
        """
        author_subdivisions = list(
            models.Authors.objects.exclude(department__isnull=True)
            .values("author_id", "name", "surname", "patronymic",
                    "department", "department__name",
                    "department__subdivision", "department__subdivision__name"))
        authors = list(
            models.Authors.objects.filter(department__isnull=True)
            .values("author_id", "name", "surname", "patronymic", ))
        for author in authors:
            author.update({
                "type": "author",
                "id": author["author_id"]
            })
        items = []
        if author_subdivisions:
            a = author_subdivisions.pop()
            items.append({"type": "subdivision",
                          "expanded": True,
                          "id": a["department__subdivision"],
                          "name": a["department__subdivision__name"],
                          "items": [{"type": "department",
                                     "expanded": True,
                                     "id": a["department"],
                                     "name": a["department__name"],
                                     "items": [{"type": "author",
                                                "id": a["author_id"],
                                                "name": a["name"],
                                                "surname": a["surname"],
                                                "patronymic": a["patronymic"]
                                               }]
                                    }
                          ]
            })
            for a in author_subdivisions:
                subdivision = index(items, "id", a["department__subdivision"])
                if subdivision != -1:
                    department = index(items[subdivision]["items"], "id", a["department"])
                    if department != -1:
                        items[subdivision]["items"][department]["items"].append(
                            {"type": "author",
                             "id": a["author_id"],
                             "name": a["name"],
                             "surname": a["surname"],
                             "patronymic": a["patronymic"]
                            }
                        )
                    else:
                        items[subdivision]["items"].append(
                            {"type": "department",
                             "expanded": True,
                             "id": a["department"],
                             "name": a["department__name"],
                             "items": [{"type": "author",
                                        "id": a["author_id"],
                                        "name": a["name"],
                                        "surname": a["surname"],
                                        "patronymic": a["patronymic"]
                                       }
                             ]
                            }
                        )
                else:
                    items.append({"type": "subdivision",
                                  "expanded": True,
                                  "id": a["department__subdivision"],
                                  "name": a["department__subdivision__name"],
                                  "items": [{"type": "department",
                                             "expanded": True,
                                             "id": a["department"],
                                             "name": a["department__name"],
                                             "items": [{"type": "author",
                                                        "id": a["author_id"],
                                                        "name": a["name"],
                                                        "surname": a["surname"],
                                                        "patronymic": a["patronymic"]
                                                       }]
                                            }
                                  ]
                    })
        items += authors
        if items:
            return HttpResponse(json.dumps(items), content_type="application/json")
        else:
            return HttpResponse(json.dumps(""), content_type="application/json")

    @staticmethod
    def search_data_source(request):
        """
        Подсказки для поиска
        """
        items = list(
            models.IntellectualProperty.objects.
            values("name").order_by().distinct())
        items.extend(list(
            models.IntellectualProperty.objects.
            extra(select={'name': 'code'}).
            values("name").order_by().distinct()))
        items.extend(list(
            models.Tags.objects.
            values("name").order_by().distinct()))
        items.extend(list(
            models.Directions.objects.
            values("name").order_by().distinct()))
        return HttpResponse(json.dumps(items), content_type="application/json")

    @staticmethod
    def search(request):
        """
        Поиск по ИС
        """
        options = json.loads(request.POST.get("options"))
        type = options.get("type", "")
        take = options.get("take", 0)
        skip = options.get("skip", 0)

        query = options.get("query", "")
        field = options.get("field", "")

        if type and field == "":
            items = models.IntellectualProperty.objects.filter(doc_type=type)
        else:
            items = models.IntellectualProperty.objects.all()

        if query:
            if field == "TAG":
                tags = models.Tags.objects.filter(name__icontains=query)
                items = items.filter(tags__in=tags).distinct()
            elif field == "AUTHOR":
                if type == "subdivision":
                    authors = models.Authors.objects.filter(department__subdivision=query)
                elif type == "department":
                    authors = models.Authors.objects.filter(department=query)
                elif type == "author":
                    authors = [models.Authors.objects.get(author_id=query)]
                else:
                    authors = []

                items = items.filter(authors__in=authors)
            else:
                items_name_contains = items.filter(
                    reduce(lambda x, y: x | y, [Q(name__icontains=word) for word in query]))

                items_code_contains = items.filter(
                    reduce(lambda x, y: x | y, [Q(code__icontains=word) for word in query]))

                direction_contains = items.filter(
                    reduce(lambda x, y: x | y, [Q(direction__name__icontains=word) for word in query]))

                tags = models.Tags.objects.filter(
                    reduce(lambda x, y: x | y, [Q(name__icontains=word) for word in query]))
                tags_contains = items.filter(tags__in=tags).distinct()

                items = list(set(
                    chain(items_name_contains, items_code_contains, direction_contains, tags_contains)))

        result = []
        total = len(items)
        items = items[skip:skip + take]
        for i_p in items:
            item = {
                "intellectual_property_id": i_p.intellectual_property_id,
                "code": i_p.code,
                "name": i_p.name}
            files = models.Files.objects.filter(intellectual_property=i_p.intellectual_property_id)
            item["has_files"] = True if files else False

            item["start_date"] = date_converter(i_p.start_date)
            item["public_date"] = date_converter(i_p.public_date)
            item["end_date"] = date_converter(i_p.end_date)

            item["doc_type"] = i_p.doc_type.name if i_p.doc_type else None
            item["direction"] = i_p.direction.name if i_p.direction else None
            item["authors"] = [str(a) for a in i_p.authors.all()]
            item["tags"] = [t.name for t in i_p.tags.all()]
            result.append(item)
        if result:
            return HttpResponse(json.dumps({"items": result, "total": total}), content_type="application/json")
        else:
            return HttpResponse(json.dumps({"items": [], "total": 0}), content_type="application/json")

    # @staticmethod
    # def search_by_author(request):
    #     """
    #     Поиск по ИС по автору универу и факультету
    #     """
    #     search_param = json.loads(request.POST.get("item"))
    #     search_id = search_param["id"]
    #     if search_param["type"] == "subdivision":
    #         authors = models.Authors.objects.filter(department__subdivision=search_id)
    #     elif search_param["type"] == "department":
    #         authors = models.Authors.objects.filter(department=search_id)
    #     elif search_param["type"] == "author":
    #         authors = [models.Authors.objects.get(author_id=search_id)]
    #     else:
    #         authors = []
    #
    #     intellectual_properties = list(
    #         models.IntellectualProperty.objects.filter(authors__in=authors)
    #         .distinct()
    #         .values("intellectual_property_id", "code", "name", "doc_type", "direction")
    #     )
    #     for item in intellectual_properties:
    #         try:
    #             files = models.Files.objects.filter(intellectual_property=item["intellectual_property_id"])
    #             item["has_files"] = True if files else False
    #         except models.Files.DoesNotExist:
    #             item["has_files"] = False
    #         try:
    #             doc_type = models.DocumentTypes.objects.get(doc_type_id=item["doc_type"])
    #             item["doc_type"] = {"doc_type_id": doc_type.doc_type_id if doc_type else "",
    #                                 "name": doc_type.name if doc_type else ""}
    #         except models.DocumentTypes.DoesNotExist:
    #             item["doc_type"] = {"doc_type_id": "", "name": ""}
    #         try:
    #             direction = models.Directions.objects.get(direction_id=item["direction"])
    #             item["direction"] = {"direction_id": direction.direction_id if direction else "",
    #                                  "name": direction.name if direction else ""}
    #         except models.Directions.DoesNotExist:
    #             item["direction"] = {"direction_id": "", "name": ""}
    #         authors = list(
    #             models.Authors.objects.
    #             filter(intellectualproperty=int(item["intellectual_property_id"])).
    #             values("author_id", "name", "surname", "patronymic")
    #         )
    #         item["authors"] = [{"author_id": a["author_id"],
    #                             "name": "%s %s %s" % (estr(a["surname"]), estr(a["name"]), estr(a["patronymic"]))}
    #                            for a in authors]
    #         tags = list(
    #             models.Tags.objects.all().
    #             filter(intellectualproperty=int(item["intellectual_property_id"])).
    #             values("tag_id", "name")
    #         )
    #         item["tags"] = [{"tag_id": t["tag_id"],
    #                          "name": t["name"]}
    #                         for t in tags]
    #
    #     if intellectual_properties:
    #         return HttpResponse(json.dumps(intellectual_properties), content_type="application/json")
    #     else:
    #         return HttpResponse(json.dumps(""), content_type="application/json")