# -*- coding: utf-8 -*-

__author__ = 'murad'

from django.shortcuts import render_to_response, HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseForbidden
from datetime import *
import json


def home_page(request):
    """
    возвращает главную страницу
    """

    if request.user.is_superuser:
        if request.user.is_staff:
            return render_to_response("users.html")
        else:
            return render_to_response("admin.html")
    else:
        return render_to_response("main.html")


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
