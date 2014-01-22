# -*- coding: utf-8 -*-

__author__ = 'user'

from django.conf.urls import patterns, url

urlpatterns = patterns('main.views',
                       url(r'^$', 'home_page'),
                       url(r'^login/$', 'log_in'),
                       url(r'^logout/$', 'log_out')
                       )
