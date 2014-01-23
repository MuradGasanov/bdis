# -*- coding: utf-8 -*-

from django.shortcuts import render_to_response, HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseForbidden
from main.additionally.public import *
import main.models as models
from django.contrib.auth.models import User
from django.core.validators import email_re
from django.core.mail import send_mail
from django.utils.timezone import utc
from datetime import *
import json
import re


def home_page(request):
    """
    возвращает главную страницу
    """

    if request.user.is_superuser:
        return render_to_response('admin.html')
    else:
        return render_to_response('main.html')


def log_in(request):
    """
    вход в профиль
    """

    errors_list = []

    try:
        data = json.loads(request.body)
    except (TypeError, ValueError):
        return HttpResponseForbidden()

    if not isinstance(data, dict):
        return HttpResponseForbidden()

    username = data.get('login')
    password = data.get('password')

    if not isinstance(username, unicode):
        return HttpResponseForbidden()

    if not isinstance(password, unicode):
        return HttpResponseForbidden()

    user = authenticate(username=username, password=password)

    if user:
        login(request, user)
        request.session.set_expiry(timedelta(days=1).seconds)
        if user.is_active:
            return HttpResponse(json.dumps({'error': errors_list}), content_type='application/json')
        else:
            return HttpResponse(json.dumps({'error': ["Пользователь заблокирован"]}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': ["Неверный логин и пароль"]}), content_type='application/json')


def log_out(request):
    """
    выходит из профиля
    """

    logout(request)
    return HttpResponseRedirect('/')


class Subdivision():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод списка подразделений
        """
        subdivisions = list(models.Subdivision.objects.all().values('id', 'name', 'tel'))

        return HttpResponse(json.dumps(subdivisions), content_type='application/json')

    @staticmethod
    def destroy(request):
        """
        удаление подразделений
        """
        lst_data = json.loads(request.POST.get('item'))
        for item in lst_data:
            models.Subdivision.objects.get(id=int(item['id'])).delete()
        return HttpResponse(json.dumps({}), content_type='application/json')


class Department():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод списка факудьтетов
        """
        subdivision_id = json.loads(request.POST.get('subdivision_id'))
        department = list(models.Department.objects.all().filter(subdivision_id=subdivision_id))
        if department:
            return HttpResponse(json.dumps(department), content_type='application/json')
        else:
            return HttpResponse(json.dumps({}), content_type='application/json')

    @staticmethod
    def destroy(request):
        """
        удаление факультетов
        """
        # lst_data = json.loads(request.POST.get('item'))
        # for item in lst_data:
        #     models.Subdivision.objects.get(id=int(item['id'])).delete()
        # return HttpResponse(json.dumps({}), content_type='application/json')
        pass