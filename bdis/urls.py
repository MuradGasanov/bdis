from django.conf.urls import patterns, include, url
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin

urlpatterns = patterns('',
                       url(r'^login_error/', "main.views.common.login_error"),
                       url(r'^social/', include('social_auth.urls')),
                       url(r'', include('main.urls'))
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)