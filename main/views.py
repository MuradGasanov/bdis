# -*- coding: utf-8 -*-

from django.shortcuts import render_to_response, HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseForbidden
from main.additionally.public import *
import main.models as models
from django.contrib.auth.models import User
from django.core.validators import email_re
from django.core.mail import send_mail
from django.utils.timezone import utc
from datetime import *
import json
import re


def estr(s):
        return '' if s is None else str(s)
########################################################################################################################


def home_page(request):
    """
    возвращает главную страницу
    """

    if request.user.is_superuser:
        return render_to_response("admin.html")
    else:
        return render_to_response("main.html")
########################################################################################################################


def log_in(request):
    """
    вход в профиль
    """

    errors_list = []

    try:
        data = json.loads(request.body)
    except (TypeError, ValueError):
        return HttpResponseForbidden()

    if not isinstance(data, dict):
        return HttpResponseForbidden()

    username = data.get("login")
    password = data.get("password")

    user = authenticate(username=username, password=password)

    if user:
        login(request, user)
        request.session.set_expiry(timedelta(days=1).seconds)
        if user.is_active:
            return HttpResponse(json.dumps({"error": errors_list}), content_type="application/json")
        else:
            return HttpResponse(json.dumps({"error": ["Пользователь заблокирован"]}), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"error": ["Неверный логин и пароль"]}), content_type="application/json")
########################################################################################################################


def log_out(request):
    """
    выходит из профиля
    """
    logout(request)
    return HttpResponseRedirect("/")
########################################################################################################################


class Subdivision():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод списка подразделений
        """
        subdivisions = list(models.Subdivision.objects.all().values("subdivision_id", "name", "tel"))
        return HttpResponse(json.dumps(subdivisions), content_type="application/json")

    @staticmethod
    def destroy(request):
        """
        удаление подразделений
        """
        item = json.loads(request.POST.get("item"))
        models.Subdivision.objects.get(subdivision_id=int(item["subdivision_id"])).delete()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def create(request):
        """
        добавление подразделений
        """
        item = json.loads(request.POST.get("item"))
        # new_subdivision = models.Subdivision(name=item["name"], tel=item["tel"])
        # new_subdivision.save(force_insert=True)
        new_subdivision = models.Subdivision.objects.create(
            name=item["name"],
            tel=item["tel"])
        return HttpResponse(json.dumps({"subdivision_id": new_subdivision.subdivision_id,
                                        "name": new_subdivision.name,
                                        "tel": new_subdivision.tel}), content_type="application/json")

    @staticmethod
    def update(request):
        """
        редактирование подразделений
        """
        item = json.loads(request.POST.get("item"))
        models.Subdivision.objects.filter(subdivision_id=item["subdivision_id"]).update(
            name=item["name"],
            tel=item["tel"]
        )
        return HttpResponse(json.dumps({}), content_type="application/json")
########################################################################################################################


class Department():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод списка факудьтетов
        """
        if "subdivision_id" in request.POST:
            subdivision_id = json.loads(request.POST.get("subdivision_id"))
            department = list(
                models.Department.objects.all().
                filter(subdivision_id=subdivision_id).
                values("department_id", "name", "mail", "tel")
            )
        else:
            department = list(
                models.Department.objects.all().
                values("department_id", "name", "mail", "tel", "subdivision_id")
            )
        if department:
            return HttpResponse(json.dumps(department), content_type="application/json")
        else:
            return HttpResponse(json.dumps(""), content_type="application/json")

    @staticmethod
    def destroy(request):
        """
        удаление факультетов
        """
        item = json.loads(request.POST.get("item"))
        models.Department.objects.get(department_id=int(item["department_id"])).delete()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def create(request):
        """
        добавление факультетов
        """
        item = json.loads(request.POST.get("item"))
        subdivision = models.Subdivision.objects.get(subdivision_id=int(item["subdivision_id"]))
        new_department = models.Department.objects.create(
            name=item["name"],
            tel=item["tel"],
            mail=item["mail"],
            subdivision=subdivision)
        return HttpResponse(json.dumps({"department_id": new_department.department_id,
                                        "name": new_department.name,
                                        "tel": new_department.tel,
                                        "mail": new_department.mail}), content_type="application/json")

    @staticmethod
    def update(request):
        """
        редактирование факультетов
        """
        item = json.loads(request.POST.get("item"))
        models.Department.objects.filter(department_id=item["department_id"]).update(
            name=item["name"],
            tel=item["tel"]
        )
        return HttpResponse(json.dumps({}), content_type="application/json")
########################################################################################################################


class Authors():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод списка авторов
        """
        authors = list(
            models.Authors.objects.all().
            values("author_id", 
                   "name", "surname", "patronymic", 
                   "mail", "tel", "post", 
                   "department", "department__name")
        )
        if authors:
            return HttpResponse(json.dumps(authors), content_type="application/json")
        else:
            return HttpResponse(json.dumps(""), content_type="application/json")

    @staticmethod
    def destroy(request):
        """
        удаление автора
        """
        item = json.loads(request.POST.get("item"))
        models.Authors.objects.get(author_id=int(item["author_id"])).delete()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def create(request):
        """
        добавление автора
        """
        item = json.loads(request.POST.get("item"))
        if item["department"]:
            department = models.Department.objects.get(department_id=int(item["department"]))
        else:
            department = None
        new_author = models.Authors.objects.create(
            name=item["name"],
            surname=item["surname"],
            patronymic=item["patronymic"],
            tel=item["tel"],
            mail=item["mail"],
            post=item["post"],
            department=department)
        return HttpResponse(json.dumps({"author_id": new_author.author_id,
                                        "name": new_author.name,
                                        "surname": new_author.surname,
                                        "patronymic": new_author.patronymic,
                                        "tel": new_author.tel,
                                        "mail": new_author.mail,
                                        "post": new_author.post,
                                        "department": department.department_id if department else None,
                                        "department__name": department.name if department else None}),
                            content_type="application/json")

    @staticmethod
    def update(request):
        """
        редактирование автора
        """
        item = json.loads(request.POST.get("item"))
        if item["department"]:
            department = models.Department.objects.get(department_id=int(item["department"]))
        else:
            department = None
        models.Authors.objects.filter(author_id=int(item["author_id"])).update(
            name=item["name"],
            surname=item["surname"],
            patronymic=item["patronymic"],
            tel=item["tel"],
            mail=item["mail"],
            post=item["post"],
            department=department)
        author = models.Authors.objects.get(author_id=int(item["author_id"]))
        return HttpResponse(json.dumps({"author_id": author.author_id,
                                        "name": author.name,
                                        "surname": author.surname,
                                        "patronymic": author.patronymic,
                                        "tel": author.tel,
                                        "mail": author.mail,
                                        "post": author.post,
                                        "department": department.department_id if department else None,
                                        "department__name": department.name if department else None}),
                            content_type="application/json")
########################################################################################################################


class DocumentTypes():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод списка типов прав
        """
        doc_types = list(
            models.DocumentTypes.objects.all().
            values("doc_type_id", "name")
        )
        if doc_types:
            return HttpResponse(json.dumps(doc_types), content_type="application/json")
        else:
            return HttpResponse(json.dumps(""), content_type="application/json")

    @staticmethod
    def destroy(request):
        """
        удаление типа права
        """
        item = json.loads(request.POST.get("item"))
        models.DocumentTypes.objects.get(doc_type_id=int(item["doc_type_id"])).delete()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def create(request):
        """
        добавление типа права
        """
        item = json.loads(request.POST.get("item"))
        new_document_type = models.DocumentTypes.objects.create(name=item["name"])
        return HttpResponse(json.dumps({"doc_type_id": new_document_type.doc_type_id,
                                        "name": new_document_type.name}),
                            content_type="application/json")

    @staticmethod
    def update(request):
        """
        редактирование типа права
        """
        item = json.loads(request.POST.get("item"))
        models.DocumentTypes.objects.filter(doc_type_id=int(item["doc_type_id"])).update(name=item["name"])
        document_type = models.DocumentTypes.objects.get(doc_type_id=int(item["doc_type_id"]))
        return HttpResponse(json.dumps({"doc_type_id": document_type.doc_type_id,
                                        "name": document_type.name}),
                            content_type="application/json")
########################################################################################################################


class Directions():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод списка направлений
        """
        directions = list(
            models.Directions.objects.all().
            values("direction_id", "name")
        )
        if directions:
            return HttpResponse(json.dumps(directions), content_type="application/json")
        else:
            return HttpResponse(json.dumps(""), content_type="application/json")

    @staticmethod
    def destroy(request):
        """
        удаление направлений
        """
        item = json.loads(request.POST.get("item"))
        models.Directions.objects.get(direction_id=int(item["direction_id"])).delete()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def create(request):
        """
        добавление направлений
        """
        item = json.loads(request.POST.get("item"))
        new_direction = models.Directions.objects.create(name=item["name"])
        return HttpResponse(json.dumps({"direction_id": new_direction.direction_id,
                                        "name": new_direction.name}),
                            content_type="application/json")

    @staticmethod
    def update(request):
        """
        редактирование направлений
        """
        item = json.loads(request.POST.get("item"))
        models.Directions.objects.filter(direction_id=item["direction_id"]).update(name=item["name"])
        return HttpResponse(json.dumps({}), content_type="application/json")
########################################################################################################################


class IntellectualProperty():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод спсика интеллектуальной собственнсоть
        """
        intellectual_properties = list(
            models.IntellectualProperty.objects.all().
            values("intellectual_property_id", "name",
                   "doc_type", "direction")
        )
        for item in intellectual_properties:
            try:
                doc_type = models.DocumentTypes.objects.get(doc_type_id=item["doc_type"])
                item["doc_type"] = {"doc_type_id": doc_type.doc_type_id,
                                    "name": doc_type.name}
            except models.DocumentTypes.DoesNotExist:
                item["doc_type"] = {}
            try:
                direction = models.Directions.objects.get(direction_id=item["direction"])
                item["direction"] = {"direction_id": direction.direction_id,
                                     "name": direction.name}
            except models.Directions.DoesNotExist:
                item["direction"] = {}
            authors = list(
                models.Authors.objects.
                filter(intellectualproperty=int(item["intellectual_property_id"])).
                values("author_id", "name", "surname", "patronymic")
            )
            item["authors"] = [{"author_id": a["author_id"],
                                "name": "%s %s %s" % (estr(a["surname"]), estr(a["name"]), estr(a["patronymic"]))}
                               for a in authors]
            tags = list(
                models.Tags.objects.all().
                filter(intellectualproperty=int(item["intellectual_property_id"])).
                values("tag_id", "name")
            )
            item["tags"] = [{"tag_id": t["tag_id"],
                             "name": t["name"]}
                            for t in tags]

        if intellectual_properties:
            return HttpResponse(json.dumps(intellectual_properties), content_type="application/json")
        else:
            return HttpResponse(json.dumps(""), content_type="application/json")

    @staticmethod
    def destroy(request):
        """
        удаление интеллектуальной собственнсоти
        """
        item = json.loads(request.POST.get("item"))
        models.IntellectualProperty.objects.get(
            intellectual_property_id=int(item["intellectual_property_id"])).delete()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def create(request):
        """
        добавление
        """
        item = json.loads(request.POST.get("item"))
        try:
            doc_type = models.DocumentTypes.objects.get(doc_type_id=item["doc_type"]["doc_type_id"])
        except models.DocumentTypes.DoesNotExist:
            doc_type = None
        try:
            direction = models.Directions.objects.get(direction_id=item["direction"]["direction_id"])
        except models.Directions.DoesNotExist:
            direction = None
        authors = [models.Authors.objects.get(author_id=int(a["author_id"])) for a in item["authors"]]
        tags = [models.Tags.objects.get(tag_id=int(t["tag_id"])) for t in item["tags"]]

        new_intellectual_property = models.IntellectualProperty.objects.create(
            name=item["name"],
            doc_type=doc_type,
            direction=direction)
        for author in authors:
            new_intellectual_property.authors.add(author)

        for tag in tags:
            new_intellectual_property.tags.add(tag)

        doc_type = {
            "doc_type_id": doc_type.doc_type_id if doc_type else 0,
            "name": doc_type.name if doc_type else ""
        }
        direction = {
            "direction_id": direction.direction_id if direction else 0,
            "name": direction.name if direction else ""
        }
        authors = \
            [{"author_id": a.author_id,
              "name": "%s %s %s" % (estr(a.surname), estr(a.name), estr(a.patronymic))}
             for a in authors]
        tags = \
            [{"tag_id": t.tag_id,
              "name": t.name}
             for t in tags]
        return HttpResponse(json.dumps({"intellectual_property_id": new_intellectual_property.intellectual_property_id,
                                        "name": new_intellectual_property.name,
                                        "doc_type": doc_type,
                                        "direction": direction,
                                        "authors": authors,
                                        "tags": tags}), content_type="application/json")

    @staticmethod
    def update(request):
        """
        редактирование
        """
        item = json.loads(request.POST.get("item"))
        doc_type = None
        if "doc_type" in item:
            if item["doc_type"]:
                try:
                    doc_type = models.DocumentTypes.objects.get(doc_type_id=item["doc_type"]["doc_type_id"])
                except models.DocumentTypes.DoesNotExist:
                    doc_type = None
        direction = None
        if "direction" in item:
            if item["direction"]:
                try:
                    direction = models.Directions.objects.get(direction_id=item["direction"]["direction_id"])
                except models.Directions.DoesNotExist:
                    direction = None

        authors = [models.Authors.objects.get(author_id=int(a["author_id"])) for a in item["authors"]]
        tags = [models.Tags.objects.get(tag_id=int(t["tag_id"])) for t in item["tags"]]

        intellectual_property = models.IntellectualProperty.\
            objects.get(intellectual_property_id=int(item["intellectual_property_id"]))
        intellectual_property.name = item["name"]
        intellectual_property.doc_type = doc_type
        intellectual_property.direction = direction
        intellectual_property.save()
        intellectual_property.authors.clear()
        for author in authors:
            intellectual_property.authors.add(author)
        intellectual_property.tags.clear()
        for tag in tags:
            intellectual_property.tags.add(tag)

        if doc_type:
            doc_type = {"doc_type_id": doc_type.doc_type_id,
                        "name": doc_type.name}
        if direction:
            direction = {"direction_id": direction.direction_id,
                         "name": direction.name}
        authors = \
            [{"author_id": a.author_id,
              "name": "%s %s %s" % (estr(a.surname), estr(a.name), estr(a.patronymic))}
             for a in authors]
        tags = \
            [{"tag_id": t.tag_id,
              "name": t.name}
             for t in tags]

        return HttpResponse(json.dumps({
            "intellectual_property_id": intellectual_property.intellectual_property_id,
            "name": intellectual_property.name,
            "doc_type": doc_type,
            "direction": direction,
            "authors": authors,
            "tags": tags
        }), content_type="application/json")
########################################################################################################################


class Tags():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод списка
        """
        tags = list(
            models.Tags.objects.all().
            values("tag_id", "name")
        )
        if tags:
            return HttpResponse(json.dumps(tags), content_type="application/json")
        else:
            return HttpResponse(json.dumps(""), content_type="application/json")

    @staticmethod
    def destroy(request):
        """
        удаление
        """
        item = json.loads(request.POST.get("item"))
        models.Tags.objects.get(tag_id=int(item["tag_id"])).delete()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def create(request):
        """
        добавление
        """
        item = json.loads(request.POST.get("item"))
        new_tag = models.Tags.objects.create(name=item["name"])
        return HttpResponse(json.dumps({"tag_id": new_tag.tag_id,
                                        "name": new_tag.name}),
                            content_type="application/json")

    @staticmethod
    def update(request):
        """
        редактирование
        """
        item = json.loads(request.POST.get("item"))
        tag = models.Tags.objects.get(tag_id=int(item["tag_id"]))
        tag.name = item["name"]
        tag.save()
        return HttpResponse(json.dumps({}), content_type="application/json")
########################################################################################################################


class Files():
    def __init__(self):
        pass

    @staticmethod
    def upload(request):
        item = json.loads(request.POST.get("item"))
        intellectual_property = models.IntellectualProperty.\
            objects.get(intellectual_property_id=int(item["intellectual_property_id"]))
        f = request.FILES['files']
        models.Files.objects.create(
            file=f,
            name=f.name,
            intellectual_property=intellectual_property
        )
        return HttpResponse(json.dumps("ok"), content_type="application/json")