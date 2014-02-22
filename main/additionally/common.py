# -*- coding: utf-8 -*-

__author__ = 'user'


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