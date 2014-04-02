# -*- coding: utf-8 -*-

from django.shortcuts import HttpResponse
import main.models as models
import json

__author__ = 'murad'


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