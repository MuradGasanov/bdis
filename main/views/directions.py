# -*- coding: utf-8 -*-

from django.shortcuts import HttpResponse
import main.models as models
import json

__author__ = 'murad'


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

    # @staticmethod
    # def destroy(request):
    #     """
    #     удаление направлений
    #     """
    #     item = json.loads(request.POST.get("item"))
    #     models.Directions.objects.get(direction_id=int(item["direction_id"])).delete()
    #     return HttpResponse(json.dumps({}), content_type="application/json")
    #
    # @staticmethod
    # def create(request):
    #     """
    #     добавление направлений
    #     """
    #     item = json.loads(request.POST.get("item"))
    #     new_direction = models.Directions.objects.create(name=item["name"])
    #     return HttpResponse(json.dumps({"direction_id": new_direction.direction_id,
    #                                     "name": new_direction.name}),
    #                         content_type="application/json")
    #
    # @staticmethod
    # def update(request):
    #     """
    #     редактирование направлений
    #     """
    #     item = json.loads(request.POST.get("item"))
    #     direction = models.Directions.objects.get(direction_id=item["direction_id"])
    #     direction.name = item["name"]
    #     direction.save()
    #     return HttpResponse(json.dumps({"direction_id": direction.direction_id,
    #                                     "name": direction.name}), content_type="application/json")