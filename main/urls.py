# -*- coding: utf-8 -*-

__author__ = 'user'

from django.conf.urls import patterns, url
from main.views import *

ADMIN_BASE_URL = "admin/"

urlpatterns = patterns('main.views',
                       url(r'^$', home_page),
                       url(r'^login/$', log_in),
                       url(r'^logout/$', log_out),

                       url(r'^'+ADMIN_BASE_URL+'subdivision/read/$', Subdivision.read),
                       url(r'^'+ADMIN_BASE_URL+'subdivision/destroy/$', Subdivision.destroy),

                       url(r'^'+ADMIN_BASE_URL+'department/read/$', Department.read),
                       url(r'^'+ADMIN_BASE_URL+'department/destroy/$', Department.destroy),
                       )
