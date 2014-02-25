# -*- coding: utf-8 -*-

import dateutil.parser
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


def date_parser(iso_string):
    return dateutil.parser.parse(iso_string) if iso_string else None


def date_to_iso(date):
    return date.isoformat() if date else ""


def remove_illegal_chars(name):
    # Удалить из имени файла все запрешенные символы
    return re.sub("[<>:/\\|?*\"]|[\0-\31]", "", name)