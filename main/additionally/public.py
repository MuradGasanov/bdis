# -*- coding: utf-8 -*-

__author__ = 'user'


def get_or_none(model, **kwargs):
    """
    Определит объект в базе данных или вернет None
    """
    try:
        o = model.objects.get(**kwargs)
    except:
        return None
    return o