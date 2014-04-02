# -*- coding: utf-8 -*-

from django.shortcuts import HttpResponse
import main.models as models
import json

__author__ = 'murad'


class Subdivision():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод списка подразделений
        """
        subdivisions = list(models.Subdivision.objects
                            .filter(user=request.user.id)
                            .values("subdivision_id", "name", "tel"))
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
            tel=item["tel"],
            user=request.user)
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
