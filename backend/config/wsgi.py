"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()

# Automatically ensure database tables are migrated and ready on boot
try:
    from django.core.management import call_command
    print("[DRQR Startup] Running database migrations...")
    call_command('migrate', interactive=False)
    print("[DRQR Startup] Migrations completed successfully.")
except Exception as e:
    print(f"[DRQR Startup] Migration notice: {e}")

try:
    from accounts.models import User
    from django.core.management import call_command
    if not User.objects.exists():
        print("[DRQR Startup] Database is empty. Seeding demo hospital & patient accounts...")
        call_command('seed_demo_data')
        print("[DRQR Startup] Demo data seeded successfully.")
except Exception as e:
    print(f"[DRQR Startup] Demo seed notice: {e}")
