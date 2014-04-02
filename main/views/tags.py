# -*- coding: utf-8 -*-

from django.shortcuts import HttpResponse
import main.models as models
import json

__author__ = 'murad'


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

    # @staticmethod
    # def destroy(request):
    #     """
    #     удаление
    #     """
    #     item = json.loads(request.POST.get("item"))
    #     models.Tags.objects.get(tag_id=int(item["tag_id"])).delete()
    #     return HttpResponse(json.dumps({}), content_type="application/json")
    #
    # @staticmethod
    # def create(request):
    #     """
    #     добавление
    #     """
    #     item = json.loads(request.POST.get("item"))
    #     new_tag = models.Tags.objects.create(name=item["name"])
    #     return HttpResponse(json.dumps({"tag_id": new_tag.tag_id,
    #                                     "name": new_tag.name}),
    #                         content_type="application/json")
    #
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