# -*- coding: utf-8 -*-

from django.shortcuts import render_to_response, HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseForbidden
from django.contrib.auth.models import User
from django.core.validators import email_re
from django.core.mail import send_mail
from django.utils.timezone import utc
from datetime import *
import json
import re


def home_page(r):
    """
    возвращает главную страницу
    """
    return render_to_response('login.html')


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

        return HttpResponse(json.dumps({'error': errors_list}), content_type='application/json')

    return HttpResponseForbidden()


def log_out(request):
    """
    выходит из профиля
    """

    logout(request)
    return HttpResponse(json.dumps({'error': []}), content_type='application/json')
