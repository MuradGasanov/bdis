# -*- coding: utf-8 -*-

from django.shortcuts import HttpResponse
import main.models as models
import json

__author__ = 'murad'


class Department():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод списка факультетов
        """
        if "subdivision_id" in request.POST:
            subdivision_id = json.loads(request.POST.get("subdivision_id"))
            department = list(
                models.Department.objects.all()
                .filter(subdivision_id=subdivision_id)
                .values("department_id", "name", "mail", "tel")
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