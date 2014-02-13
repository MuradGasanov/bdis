# -*- coding: utf-8 -*-

from django.shortcuts import render_to_response, HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseForbidden
import main.models as models
from datetime import *
import json
import os
import zipfile
import StringIO
from django.db.models import Q
from itertools import chain
from django.conf import settings


def estr(s):
    return '' if s is None else str(s.encode('utf-8'))


def index(lst, key, value):
    for i, dic in enumerate(lst):
        if dic[key] == value:
            return i
    return -1
########################################################################################################################


def home_page(request):
    """
    возвращает главную страницу
    """

    if request.user.is_superuser:
        return render_to_response("admin.html")
    else:
        return render_to_response("user.html")
########################################################################################################################


def log_in(request):
    """
    вход в профиль
    """

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
            return HttpResponse(json.dumps({"error": []}), content_type="application/json")
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
        subdivision = models.Subdivision.objects.get(subdivision_id=item["subdivision_id"])
        subdivision.name = item["name"]
        subdivision.tel = item["tel"]
        subdivision.save()
        return HttpResponse(json.dumps({"subdivision_id": subdivision.subdivision_id,
                                        "name": subdivision.name,
                                        "tel": subdivision.tel}), content_type="application/json")
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
        for author in authors:
            author["department"] = {
                "department_id": author.pop("department") if author["department"] else "",
                "name": author.pop("department__name") if author["department__name"] else ""
            }
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
        try:
            department = models.Department.objects.get(department_id=int(item["department"]))
        except:
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
                                        "department": {"department_id": department.department_id if department else "",
                                                       "name": department.name if department else ""}}),
                            content_type="application/json")

    @staticmethod
    def update(request):
        """
        редактирование автора
        """
        item = json.loads(request.POST.get("item"))
        author = models.Authors.objects.get(author_id=int(item["author_id"]))
        try:
            department = models.Department.objects.get(department_id=item["department"])
        except:
            department = None
        author.name = item["name"]
        author.surname = item["surname"]
        author.patronymic = item["patronymic"]
        author.tel = item["tel"]
        author.mail = item["mail"]
        author.post = item["post"]
        author.department = department
        author.save()
        return HttpResponse(json.dumps({"author_id": author.author_id,
                                        "name": author.name,
                                        "surname": author.surname,
                                        "patronymic": author.patronymic,
                                        "tel": author.tel,
                                        "mail": author.mail,
                                        "post": author.post,
                                        "department": {
                                            "department_id": department.department_id if department else "",
                                            "name": department.name if department else ""}}),
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
        document_type = models.DocumentTypes.objects.get(doc_type_id=int(item["doc_type_id"]))
        document_type.name = item["name"]
        document_type.save()
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
        direction = models.Directions.objects.get(direction_id=item["direction_id"])
        direction.name = item["name"]
        direction.save()
        return HttpResponse(json.dumps({"direction_id": direction.direction_id,
                                        "name": direction.name}), content_type="application/json")
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
                item["doc_type"] = {"doc_type_id": doc_type.doc_type_id if doc_type else "",
                                    "name": doc_type.name if doc_type else ""}
            except models.DocumentTypes.DoesNotExist:
                item["doc_type"] = {"doc_type_id": "", "name": ""}
            try:
                direction = models.Directions.objects.get(direction_id=item["direction"])
                item["direction"] = {"direction_id": direction.direction_id if direction else "",
                                     "name": direction.name if direction else ""}
            except models.Directions.DoesNotExist:
                item["direction"] = {"direction_id": "", "name": ""}
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
        doc_type = item["doc_type"]
        if type(doc_type) == unicode and len(doc_type) != 0:
            try:
                doc_type = models.DocumentTypes.objects.create(name=doc_type)
            except:
                doc_type = None
        elif type(doc_type) == int:
            try:
                doc_type = models.DocumentTypes.objects.get(doc_type_id=doc_type)
            except models.DocumentTypes.DoesNotExist:
                doc_type = None
        else:
            doc_type = None

        direction = item["direction"]
        if type(direction) == unicode and len(direction) != 0:
            try:
                direction = models.Directions.objects.create(name=direction)
            except:
                direction = None
        elif type(direction) == int:
            try:
                direction = models.Directions.objects.get(direction_id=direction)
            except models.Directions.DoesNotExist:
                direction = None
        else:
            direction = None

        authors = [models.Authors.objects.get(author_id=int(a)) for a in item["authors"]]
        tags = []
        for t in item["tags"]:
            try:
                tag = models.Tags.objects.get(name=t)
            except models.Tags.DoesNotExist:
                tag = models.Tags.objects.create(name=t)
            except:
                tag = None
            if tag:
                tags.append(tag)

        new_intellectual_property = models.IntellectualProperty.objects.create(
            name=item["name"],
            doc_type=doc_type,
            direction=direction)
        for author in authors: #FIXME: добавить без цикла
            new_intellectual_property.authors.add(author)

        for tag in tags: #FIXME: добавить без цикла
            new_intellectual_property.tags.add(tag)

        doc_type = {
            "doc_type_id": doc_type.doc_type_id if doc_type else "",
            "name": doc_type.name if doc_type else ""
        }
        direction = {
            "direction_id": direction.direction_id if direction else "",
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
        doc_type = item["doc_type"]
        if type(doc_type) == int:
            try:
                doc_type = models.DocumentTypes.objects.get(doc_type_id=int(doc_type))
            except models.DocumentTypes.DoesNotExist:
                doc_type = None
        elif type(doc_type) == unicode and len(doc_type) != 0:
            try:
                doc_type = models.DocumentTypes.objects.create(name=doc_type)
            except:
                doc_type = None
        else:
            doc_type = None

        direction = item["direction"]
        if type(direction) == int:
            try:
                direction = models.Directions.objects.get(direction_id=int(direction))
            except models.Directions.DoesNotExist:
                direction = None
        elif type(direction) == unicode and len(direction) != 0:
            try:
                direction = models.Directions.objects.create(name=direction)
            except:
                direction = None
        else:
            direction = None

        authors = [models.Authors.objects.get(author_id=int(a)) for a in item["authors"]]
        tags = []
        for t in item["tags"]:
            try:
                tag = models.Tags.objects.get(name=t)
            except models.Tags.DoesNotExist:
                tag = models.Tags.objects.create(name=t)
            except:
                tag = None
            if tag:
                tags.append(tag)

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

        doc_type = {
            "doc_type_id": doc_type.doc_type_id if doc_type else "",
            "name": doc_type.name if doc_type else ""
        }
        direction = {
            "direction_id": direction.direction_id if direction else "",
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
        return HttpResponse(json.dumps({"tag_id": tag.tag_id,
                                        "name": tag.name}), content_type="application/json")
########################################################################################################################


class Files():
    def __init__(self):
        pass

    @staticmethod
    def upload(request):
        """
        Привязывание файла к ИС
        """
        item = json.loads(request.POST.get("item"))
        intellectual_property = models.IntellectualProperty.\
            objects.get(intellectual_property_id=int(item["intellectual_property_id"]))
        f = request.FILES['files']
        new_file = models.Files.objects.create(
            file=f,
            name=f.name,
            size=f.size,
            extension=os.path.splitext(f.name)[1],
            intellectual_property=intellectual_property
        ) #.values("file_id", "name", "size", "extension")
        return HttpResponse(json.dumps({
            "file_id": new_file.file_id,
            "name": new_file.name,
            "size": new_file.size,
            "extension": new_file.extension
        }), content_type="application/json")

    @staticmethod
    def get_list(request):
        """
        Получить список файлов ИС
        """
        item = json.loads(request.POST.get("item"))
        files = list(
            models.Files.objects.all().
            filter(intellectual_property=item["intellectual_property_id"]).
            values("file_id", "name", "size", "extension")
        )
        if files:
            return HttpResponse(json.dumps(files), content_type="application/json")
        else:
            return HttpResponse(json.dumps(""), content_type="application/json")

    @staticmethod
    def delete(request):
        """
        Удаление файла
        """
        item = json.loads(request.POST.get("item"))
        for f in item:
            models.Files.objects.get(file_id=f["file_id"]).delete()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def download(request):
        """
        Создание архива и его выгрузка
        """
        item = json.loads(request.POST.get("item"))
        intellectual_properties = models.IntellectualProperty.objects.filter(
            intellectual_property_id__in=item["files"])
        items = list(intellectual_properties.values("intellectual_property_id", "name"))
        for item in items:
            files = models.Files.objects.filter(
                intellectual_property=item["intellectual_property_id"]).values_list("file") #FIXME: брать путь из settings
            files = map(lambda f: os.path.join(os.path.dirname(__file__), 'media/', f[0]).replace('\\','/'), files)
            item["files"] = files

        zip_filename = "archive.zip"
        s = StringIO.StringIO()
        zf = zipfile.ZipFile(s, "w")
        for item in items:
            for file_path in item["files"]:
                f_dir, f_name = os.path.split(file_path)
                zip_path = os.path.join(item["name"], f_name)
                zf.write(file_path, zip_path)
        zf.close()
        response = HttpResponse(s.getvalue(), mimetype="application/x-zip-compressed")
        response['Content-Disposition'] = 'attachment; filename=%s' % zip_filename
        pass
        return response
########################################################################################################################


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
            .values("author_id", "name", "surname", "patronymic",))
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
        # f = json.loads(request.POST.get("filter"))
        # f = f.upper()
        # items = list(
        #     models.IntellectualProperty.objects.all().filter(name__icontains=f).
        #     values("intellectual_property_id", "name")
        # )
        # authors = list(
        #     models.Authors.objects.all().filter(
        #         Q(surname__icontains=f) | Q(name__icontains=f) | Q(patronymic__icontains=f)).
        #     values("author_id", "name", "surname", "patronymic")
        # )
        # items += [{"author_id": a["author_id"],
        #            "name": "%s %s %s" % (estr(a["surname"]), estr(a["name"]), estr(a["patronymic"]))}
        #
        #           for a in authors]
        # items += list(
        #     models.Tags.objects.all().filter(name__icontains=f).
        #     values("tag_id", "name")
        # )
        # items += list(
        #     models.Directions.objects.all().filter(name__icontains=f).
        #     values("direction_id", "name")
        # )
        items = list(
            models.IntellectualProperty.objects.all().
            values("intellectual_property_id", "name")
        )
        # authors = list(
        #     models.Authors.objects.all().
        #     values("author_id", "name", "surname", "patronymic")
        # )
        # items += [{"author_id": a["author_id"],
        #            "name": "%s %s %s" % (estr(a["surname"]), estr(a["name"]), estr(a["patronymic"]))}
        #           for a in authors]
        items += list(
            models.Tags.objects.all().
            values("tag_id", "name")
        )
        items += list(
            models.Directions.objects.all().
            values("direction_id", "name")
        )
        return HttpResponse(json.dumps(items), content_type="application/json")

    @staticmethod
    def search(request):
        """
        Поиск по ИС
        """
        search_param = json.loads(request.POST.get("item"))
        doc_type = int(search_param["doc_type"])
        if doc_type:
            items = models.IntellectualProperty.objects.filter(doc_type=doc_type)
        else:
            items = models.IntellectualProperty.objects.all()

        query = search_param["query"]

        items_contains = items.filter(
            reduce(lambda x, y: x | y, [Q(name__icontains=word) for word in query]))

        direction_contains = items.filter(
            reduce(lambda x, y: x | y, [Q(direction__name__icontains=word) for word in query]))

        tags = models.Tags.objects.filter(
            reduce(lambda x, y: x | y, [Q(name__icontains=word) for word in query]))
        tags_contains = items.filter(tags__in=tags).distinct()

        intellectual_properties = list(set(chain(items_contains, direction_contains, tags_contains)))

        result = []
        for item in intellectual_properties:
            new_item = {
                "intellectual_property_id": item.intellectual_property_id,
                "name": item.name}
            try:
                files = models.Files.objects.filter(intellectual_property=item.intellectual_property_id)
                new_item["has_files"] = True if files else False
            except models.Files.DoesNotExist:
                new_item["has_files"] = False
            try:
                doc_type = models.DocumentTypes.objects.get(doc_type_id=item.doc_type_id)
                new_item["doc_type"] = {"doc_type_id": doc_type.doc_type_id if doc_type else "",
                                        "name": doc_type.name if doc_type else ""}
            except models.DocumentTypes.DoesNotExist:
                new_item["doc_type"] = {"doc_type_id": "", "name": ""}
            try:
                direction = models.Directions.objects.get(direction_id=item.direction_id)
                new_item["direction"] = {"direction_id": direction.direction_id if direction else "",
                                         "name": direction.name if direction else ""}
            except models.Directions.DoesNotExist:
                new_item["direction"] = {"direction_id": "", "name": ""}
            authors = list(
                models.Authors.objects.
                filter(intellectualproperty=item.intellectual_property_id).
                values("author_id", "name", "surname", "patronymic")
            )
            new_item["authors"] = [{"author_id": a["author_id"],
                                    "name": "%s %s %s" % (estr(a["surname"]), estr(a["name"]), estr(a["patronymic"]))}
                                   for a in authors]
            tags = list(
                models.Tags.objects.all().
                filter(intellectualproperty=item.intellectual_property_id).
                values("tag_id", "name")
            )
            new_item["tags"] = [{"tag_id": t["tag_id"],
                                 "name": t["name"]}
                                for t in tags]
            result.append(new_item)

        if result:
            return HttpResponse(json.dumps(result), content_type="application/json")
        else:
            return HttpResponse(json.dumps(""), content_type="application/json")

    @staticmethod
    def search_by_author(request):
        """
        Поиск по ИС по автору универу и факультету
        """
        search_param = json.loads(request.POST.get("item"))
        search_id = search_param["id"]
        if search_param["type"] == "subdivision":
            authors = models.Authors.objects.filter(department__subdivision=search_id)
        elif search_param["type"] == "department":
            authors = models.Authors.objects.filter(department=search_id)
        elif search_param["type"] == "author":
            authors = [models.Authors.objects.get(author_id=search_id)]
        else:
            authors = []

        intellectual_properties = list(
            models.IntellectualProperty.objects.filter(authors__in=authors)
            .distinct()
            .values("intellectual_property_id", "name", "doc_type", "direction")
        )
        for item in intellectual_properties:
            try:
                files = models.Files.objects.filter(intellectual_property=item["intellectual_property_id"])
                item["has_files"] = True if files else False
            except models.Files.DoesNotExist:
                item["has_files"] = False
            try:
                doc_type = models.DocumentTypes.objects.get(doc_type_id=item["doc_type"])
                item["doc_type"] = {"doc_type_id": doc_type.doc_type_id if doc_type else "",
                                    "name": doc_type.name if doc_type else ""}
            except models.DocumentTypes.DoesNotExist:
                item["doc_type"] = {"doc_type_id": "", "name": ""}
            try:
                direction = models.Directions.objects.get(direction_id=item["direction"])
                item["direction"] = {"direction_id": direction.direction_id if direction else "",
                                     "name": direction.name if direction else ""}
            except models.Directions.DoesNotExist:
                item["direction"] = {"direction_id": "", "name": ""}
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
########################################################################################################################


class Directory():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод списка
        """
        items = list(
            models.DownloadDir.objects.all().
            values("download_dir_id", "name")
        )
        map(lambda d: d.update({
            "intellectual_properties_id": [i[0] for i in models.IntellectualProperty.objects.filter(
                downloaddir=d["download_dir_id"]
            ).values_list("intellectual_property_id")]}), items)
        if items:
            return HttpResponse(json.dumps(items), content_type="application/json")
        else:
            return HttpResponse(json.dumps(""), content_type="application/json")

    @staticmethod
    def destroy(request):
        """
        удаление
        """
        item = json.loads(request.POST.get("item"))
        models.DownloadDir.objects.get(download_dir_id=int(item["download_dir_id"])).delete()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def create(request):
        """
        добавление
        """
        item = json.loads(request.POST.get("item"))
        #intellectual_property = models.IntellectualProperty.objects.filter(
        #    intellectual_property_id__in=item["intellectual_properties_id"])
        new_directory = models.DownloadDir.objects.create(name=item["name"])
        new_directory.intellectual_property.add(*item["intellectual_properties_id"])
        intellectual_properties_id = [i[0] for i in models.IntellectualProperty.objects.filter(
            downloaddir=new_directory.download_dir_id).values_list("intellectual_property_id")]
        return HttpResponse(json.dumps({"download_dir_id": new_directory.download_dir_id,
                                        "name": new_directory.name,
                                        "intellectual_properties_id": intellectual_properties_id}),
                            content_type="application/json")

    # @staticmethod
    # def update(request):
    #     """
    #     редактирование
    #     """
    #     item = json.loads(request.POST.get("item"))
    #     tag = models.Tags.objects.get(tag_id=int(item["tag_id"]))
    #     tag.name = item["name"]
    #     tag.save()
    #     return HttpResponse(json.dumps({"tag_id": tag.tag_id,
    #                                     "name": tag.name}), content_type="application/json")
########################################################################################################################
