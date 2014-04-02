# -*- coding: utf-8 -*-

from django.shortcuts import HttpResponse
import main.models as models
import json

__author__ = 'murad'


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

    # @staticmethod
    # def destroy(request):
    #     """
    #     удаление типа права
    #     """
    #     item = json.loads(request.POST.get("item"))
    #     models.DocumentTypes.objects.get(doc_type_id=int(item["doc_type_id"])).delete()
    #     return HttpResponse(json.dumps({}), content_type="application/json")
    #
    # @staticmethod
    # def create(request):
    #     """
    #     добавление типа права
    #     """
    #     item = json.loads(request.POST.get("item"))
    #     new_document_type = models.DocumentTypes.objects.create(name=item["name"])
    #     return HttpResponse(json.dumps({"doc_type_id": new_document_type.doc_type_id,
    #                                     "name": new_document_type.name}),
    #                         content_type="application/json")
    #
    # @staticmethod
    # def update(request):
    #     """
    #     редактирование типа права
    #     """
    #     item = json.loads(request.POST.get("item"))
    #     document_type = models.DocumentTypes.objects.get(doc_type_id=int(item["doc_type_id"]))
    #     document_type.name = item["name"]
    #     document_type.save()
    #     return HttpResponse(json.dumps({"doc_type_id": document_type.doc_type_id,
    #                                     "name": document_type.name}),
    #                         content_type="application/json")