import os
from pathlib import Path
from datetime import timedelta
from decouple import config, Csv
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
SECRET_KEY = config('DJANGO_SECRET_KEY', default='django-insecure-medical-healthcare-system-drqr-2026')

DEBUG = config('DJANGO_DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local apps
    'accounts.apps.AccountsConfig',
    'hospitals.apps.HospitalsConfig',
    'patients.apps.PatientsConfig',
    'records.apps.RecordsConfig',
    'qr_documents.apps.QrDocumentsConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Database configuration
# Supabase PostgreSQL via DATABASE_URL or SQLite fallback
import urllib.parse

DATABASE_URL = config('DATABASE_URL', default='').strip().strip('"\'')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

if DATABASE_URL and DATABASE_URL.startswith(('postgres://', 'postgresql://')):
    if '[YOUR-PASSWORD]' in DATABASE_URL or '[YOUR_DATABASE_PASSWORD]' in DATABASE_URL:
        print("Notice: DATABASE_URL contains placeholder password. Falling back to local SQLite.")
    else:
        is_pooler = 'pooler.supabase.com' in DATABASE_URL or ':6543' in DATABASE_URL
        try:
            DATABASES['default'] = dj_database_url.parse(
                DATABASE_URL,
                conn_max_age=0 if is_pooler else 600,
                conn_health_checks=not is_pooler,
                ssl_require=True if 'supabase' in DATABASE_URL else False
            )
            if is_pooler:
                DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True
        except Exception as parse_err:
            print(f"Warning: Standard DATABASE_URL parse failed: {parse_err}. Attempting URL sanitization...")
            try:
                if '://' in DATABASE_URL and '@' in DATABASE_URL:
                    scheme, remainder = DATABASE_URL.split('://', 1)
                    auth, host_part = remainder.rsplit('@', 1)
                    if ':' in auth:
                        user, raw_pass = auth.split(':', 1)
                        quoted_pass = urllib.parse.quote(raw_pass, safe='')
                        sanitized_url = f"{scheme}://{user}:{quoted_pass}@{host_part}"
                        DATABASES['default'] = dj_database_url.parse(
                            sanitized_url,
                            conn_max_age=0 if is_pooler else 600,
                            conn_health_checks=not is_pooler,
                            ssl_require=True if 'supabase' in sanitized_url else False
                        )
                        if is_pooler:
                            DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True
                        print("Notice: Successfully parsed sanitized DATABASE_URL.")
            except Exception as recovery_err:
                print(f"Notice: DATABASE_URL recovery failed ({recovery_err}). Falling back to local SQLite.")
                DATABASES = {
                    'default': {
                        'ENGINE': 'django.db.backends.sqlite3',
                        'NAME': BASE_DIR / 'db.sqlite3',
                    }
                }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'accounts.authentication.QueryParamOrHeaderJWTAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'EXCEPTION_HANDLER': 'accounts.exceptions.custom_exception_handler',
}

# Simple JWT Configuration
JWT_SIGNING_KEY = config('JWT_SIGNING_KEY', default=SECRET_KEY)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'SIGNING_KEY': JWT_SIGNING_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL', default=True, cast=bool)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost:\d+$",
    r"^http://127\.0\.0\.1:\d+$",
]
frontend_urls = config('FRONTEND_URL', default='http://localhost:5173,http://localhost:3000', cast=Csv())
CORS_ALLOWED_ORIGINS = [url.strip() for url in frontend_urls if url.strip()]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Frontend public base URL for QR codes and deep links
FRONTEND_APP_URL = config('FRONTEND_APP_URL', default='http://localhost:5173')
