# -*- coding: utf-8 -*-

from django.shortcuts import HttpResponse
import main.models as models
import json

__author__ = 'murad'


class Authors():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        # """
        # вывод списка авторов
        # """
        # authors = list(
        #     models.Authors.objects
        #     .filter(user=request.user.id)
        #     .values("author_id",
        #             "name", "surname", "patronymic",
        #             "mail", "tel", "post",
        #             "department", "department__name")
        # )
        # for author in authors:
        #     author["department"] = {
        #         "department_id": author.pop("department") if author["department"] else "",
        #         "name": author.pop("department__name") if author["department__name"] else ""
        #     }
        # if authors:
        #     return HttpResponse(json.dumps(authors), content_type="application/json")
        # else:
        #     return HttpResponse(json.dumps(""), content_type="application/json")
        """
        вывод списка авторов
        """
        authors = list(
            models.Authors.objects
            .filter(user=request.user.id)
        )
        items = list()
        for author in authors:
            item = {
                "author_id": author.author_id,
                "name": author.name,
                "surname": author.surname,
                "patronymic": author.patronymic,
                "full_name": str(author),
                "department": {
                    "department_id": author.department.department_id if author.department else "",
                    "name": author.department.name if author.department else ""
                },
                "mail": author.mail,
                "tel": author.tel,
                "post": author.post,
            }
            items.append(item)
        if items:
            return HttpResponse(json.dumps(items), content_type="application/json")
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
            department=department,
            user=request.user)
        return HttpResponse(json.dumps({"author_id": new_author.author_id,
                                        "name": new_author.name,
                                        "surname": new_author.surname,
                                        "patronymic": new_author.patronymic,
                                        "full_name": str(new_author),
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
                                        "full_name": str(author),
                                        "tel": author.tel,
                                        "mail": author.mail,
                                        "post": author.post,
                                        "department": {
                                            "department_id": department.department_id if department else "",
                                            "name": department.name if department else ""}}),
                            content_type="application/json")