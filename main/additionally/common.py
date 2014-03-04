# -*- coding: utf-8 -*-

import datetime
import re


__author__ = 'Murad Gasanov'


def try_get(model, **kwargs):
    """
    Определит объект в базе данных или вернет None
    """
    try:
        o = model.objects.get(**kwargs)
    except:
        return None
    return o


def estr(s):
    return '' if s is None else str(s.encode('utf-8'))


def index(lst, key, value):
    for i, dic in enumerate(lst):
        if dic[key] == value:
            return i
    return -1


def uni_path(path):
    return path.replace("\\", "/")


def date_parser(date_string):
    return datetime.datetime.strptime(date_string, "%Y-%m-%d") if date_string else None


def date_converter(date):
    return date.strftime("%Y-%m-%d") if date else None


def remove_illegal_chars(name):
    # Удалить из имени файла все запрешенные символы
    return re.sub("[<>:/\\|?*\"]|[\0-\31]", "", name)