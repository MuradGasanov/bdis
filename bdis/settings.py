# -*- coding: utf-8 -*-
# Django settings for bdis project.

import os
import socket

if socket.gethostname() in ("murad-P85-D3",):
    DEBUG = True
else:
    DEBUG = False

TEMPLATE_DEBUG = DEBUG
PROJECT_PATH = os.path.abspath(os.path.dirname(__name__))
PROJECT_PARENT_PATH = os.path.dirname(PROJECT_PATH)


def path(p):
    return p.replace('\\','/')

ADMINS = (
    ('Murad Gasanov', 'gmn1791@ya.ru'),
)

MANAGERS = ADMINS

DATABASES = {
    # 'default': {
    #     'ENGINE': 'django.db.backends.sqlite3',  # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
    #     'NAME': 'main/database/sqlite.db',                       # Or path to database file if using sqlite3.
    #     # The following settings are not used with sqlite3:
    #     'USER': '',
    #     'PASSWORD': '',
    #     'HOST': '',              # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
    #     'PORT': '',              # Set to empty string for default.
    # }
    'default': {
        'ENGINE': 'django.db.backends.mysql',  # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'bdis',                       # Or path to database file if using sqlite3.
        # The following settings are not used with sqlite3:
        'USER': 'bdis',
        'PASSWORD': 'bdis',
        'HOST': '127.0.0.1',     # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '3306',              # Set to empty string for default.
    }
}

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ["0.0.0.0", "127.0.0.1", "localhost", "bdis.apertura.su"]

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'Europe/Moscow'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'ru-RU'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = path(os.path.join(PROJECT_PARENT_PATH, "bdis_static/media"))
# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = '/media/'  # Do not forget to change the js files too ( users.js:10 )

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = path(os.path.join(PROJECT_PARENT_PATH, "bdis_static/static"))

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/static/'  # Do not forget to change the js files too ( users.js:10 )

# Additional locations of static files
STATICFILES_DIRS = (
    path(os.path.join(PROJECT_PATH, "main/static")),
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'x$^#l%+q0@db$gyeg@v=+dn=re+c35o(bx67hvha9hf$!+!gfd'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.templates.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    #'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    #'django.contrib.messages.middleware.MessageMiddleware',
    # 'main.middleware.middleware.MiddleWareProcess',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'social_auth.middleware.SocialAuthExceptionMiddleware',
)

ROOT_URLCONF = 'bdis.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'bdis.wsgi.application'

TEMPLATE_DIRS = ('main/templates',)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    #'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    #'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
    'gunicorn',
    'main',
    'social_auth'
)

GOOGLE_OAUTH2_CLIENT_ID = '406525787186-7t6t3q690o3fqt9pmou5cok65m42qslo.apps.googleusercontent.com'
GOOGLE_OAUTH2_CLIENT_SECRET = 'qUElNes_AqiVRiAisBZpi-y6'

SESSION_SERIALIZER = 'django.contrib.sessions.serializers.PickleSerializer'

LOGIN_REDIRECT_URL = '/'
LOGIN_ERROR_URL = '/login_error/'

AUTHENTICATION_BACKENDS = (
    'social_auth.backends.google.GoogleOAuth2Backend',
    'django.contrib.auth.backends.ModelBackend',
)

GOOGLE_WHITE_LISTED_DOMAINS = ['apertura.su']

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}
