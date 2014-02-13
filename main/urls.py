# -*- coding: utf-8 -*-

__author__ = 'user'

from django.conf.urls import patterns, url
from main.views import *

API_BASE_URL = "api/"

urlpatterns = patterns('main.views',
                       url(r'^$', home_page),
                       url(r'^login/$', log_in),
                       url(r'^logout/$', log_out),

                       url(r'^'+API_BASE_URL+'subdivision/read/$', Subdivision.read),
                       url(r'^'+API_BASE_URL+'subdivision/destroy/$', Subdivision.destroy),
                       url(r'^'+API_BASE_URL+'subdivision/create/$', Subdivision.create),
                       url(r'^'+API_BASE_URL+'subdivision/update/$', Subdivision.update),

                       url(r'^'+API_BASE_URL+'department/read/$', Department.read),
                       url(r'^'+API_BASE_URL+'department/destroy/$', Department.destroy),
                       url(r'^'+API_BASE_URL+'department/create/$', Department.create),
                       url(r'^'+API_BASE_URL+'department/update/$', Department.update),

                       url(r'^'+API_BASE_URL+'authors/read/$', Authors.read),
                       url(r'^'+API_BASE_URL+'authors/destroy/$', Authors.destroy),
                       url(r'^'+API_BASE_URL+'authors/create/$', Authors.create),
                       url(r'^'+API_BASE_URL+'authors/update/$', Authors.update),

                       url(r'^'+API_BASE_URL+'document_types/read/$', DocumentTypes.read),
                       url(r'^'+API_BASE_URL+'document_types/destroy/$', DocumentTypes.destroy),
                       url(r'^'+API_BASE_URL+'document_types/create/$', DocumentTypes.create),
                       url(r'^'+API_BASE_URL+'document_types/update/$', DocumentTypes.update),

                       url(r'^'+API_BASE_URL+'directions/read/$', Directions.read),
                       url(r'^'+API_BASE_URL+'directions/destroy/$', Directions.destroy),
                       url(r'^'+API_BASE_URL+'directions/create/$', Directions.create),
                       url(r'^'+API_BASE_URL+'directions/update/$', Directions.update),

                       url(r'^'+API_BASE_URL+'intellectual_property/read/$', IntellectualProperty.read),
                       url(r'^'+API_BASE_URL+'intellectual_property/destroy/$', IntellectualProperty.destroy),
                       url(r'^'+API_BASE_URL+'intellectual_property/update/$', IntellectualProperty.update),
                       url(r'^'+API_BASE_URL+'intellectual_property/create/$', IntellectualProperty.create),

                       url(r'^'+API_BASE_URL+'tags/read/$', Tags.read),
                       url(r'^'+API_BASE_URL+'tags/destroy/$', Tags.destroy),
                       url(r'^'+API_BASE_URL+'tags/update/$', Tags.update),
                       url(r'^'+API_BASE_URL+'tags/create/$', Tags.create),

                       url(r'^'+API_BASE_URL+'file/upload/$', Files.upload),
                       url(r'^'+API_BASE_URL+'file/get_list/$', Files.get_list),
                       url(r'^'+API_BASE_URL+'file/delete/$', Files.delete),
                       url(r'^'+API_BASE_URL+'file/download/$', Files.download),

                       url(r'^'+API_BASE_URL+'tree_data_source/$', Search.tree_data_source),
                       url(r'^'+API_BASE_URL+'search_data_source/$', Search.search_data_source),
                       url(r'^'+API_BASE_URL+'search/$', Search.search),
                       url(r'^'+API_BASE_URL+'search_by_author/$', Search.search_by_author),

                       url(r'^'+API_BASE_URL+'directory/create/$', Directory.create),
                       url(r'^'+API_BASE_URL+'directory/read/$', Directory.read),
                       url(r'^'+API_BASE_URL+'directory/destroy/$', Directory.destroy)
                       )
