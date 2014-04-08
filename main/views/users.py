# -*- coding: utf-8 -*-

from django.shortcuts import HttpResponse
from django.http import HttpResponseForbidden
from django.contrib.auth import models as auth_models
import main.models as models
import json

__author__ = 'murad'


class Users():
    def __init__(self):
        pass

    @staticmethod
    def read(r):
        items = list(
            auth_models.User.objects.filter(is_active=True)
            .values("id", "username", "first_name", "email", "is_superuser")
        )
        js = json.dumps(items)
        return HttpResponse(js, content_type="application/json")

    @staticmethod
    def create(r):
        """
        добавление
        """
        item = json.loads(r.POST.get("item"))
        items = auth_models.User.objects.filter(is_active=True)
        new_user, created = items.get_or_create(
            username=item.get("username")
        )
        if created:
            new_user.first_name = item.get("first_name")
            new_user.email = item.get("email")
            new_user.is_stuff = False
            new_user.is_superuser = item.get("is_superuser")
            new_user.set_password(item.get("password"))
            new_user.save()
        else:
            return HttpResponseForbidden()

        return HttpResponse(json.dumps({"id": new_user.id,
                                        "first_name": new_user.first_name,
                                        "username": new_user.username,
                                        "email": new_user.email,
                                        "is_superuser": new_user.is_superuser, }),
                            content_type="application/json")

    @staticmethod
    def destroy(r):
        """
        удаление
        """
        item = json.loads(r.POST.get("item"))
        user = auth_models.User.objects.get(id=int(item.get("id")))
        models.IntellectualProperty.objects.filter(user=user.id).update(is_active=False)
        if user:
            user.is_active = False
            user.username += "_deleted"
            user.save()
        else:
            return HttpResponseForbidden()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def update(r):
        """
        редактирование
        """
        item = json.loads(r.POST.get("item"))
        user = auth_models.User.objects.get(id=int(item.get("id")))
        if not user:
            return HttpResponseForbidden()
        user.first_name = item.get("first_name")
        user.email = item.get("email")
        password = item.get("password")
        if password:
            user.set_password(password)
        user.save()

        return HttpResponse(json.dumps({"id": user.id,
                                        "first_name": user.first_name,
                                        "username": user.username,
                                        "email": user.email,
                                        "is_superuser": user.is_superuser, }),
                            content_type="application/json")