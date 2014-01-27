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


def home_page(request):
    """
    возвращает главную страницу
    """

    if request.user.is_superuser:
        return render_to_response("admin.html")
    else:
        return render_to_response("main.html")


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


def log_out(request):
    """
    выходит из профиля
    """
    logout(request)
    return HttpResponseRedirect("/")


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
                   "doc_type", "doc_type__name",
                   "direction", "direction__name")
        )
        for item in intellectual_properties:
            item["authors"] = list(
                models.Authors.objects.all().
                filter(intellectualproperty=int(item["intellectual_property_id"])).
                values("author_id", "name", "surname", "patronymic")
            )
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

    # @staticmethod
    # def create(request):
    #     """
    #     добавление
    #     """
    #     item = json.loads(request.POST.get("item"))
    #     new_direction = models.Directions.objects.create(direction=item["direction"])
    #     return HttpResponse(json.dumps({"direction_id": new_direction.direction_id,
    #                                     "direction": new_direction.direction}),
    #                         content_type="application/json")
    #
    # @staticmethod
    # def update(request):
    #     """
    #     редактирование
    #     """
    #     item = json.loads(request.POST.get("item"))
    #     models.Directions.objects.filter(direction_id=item["direction_id"]).update(direction=item["direction"])
    #     return HttpResponse(json.dumps({}), content_type="application/json")