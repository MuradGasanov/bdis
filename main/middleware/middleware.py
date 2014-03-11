# -*- coding: utf-8 -*-

__author__ = 'user'

from django.shortcuts import render_to_response
from django.http import HttpResponseForbidden

class MiddleWareProcess(object):

    def process_request(self, request):
        if request.path.startswith('/api') and not request.path.startswith('/login') and \
                not request.user.is_authenticated():
            return render_to_response('login.html')