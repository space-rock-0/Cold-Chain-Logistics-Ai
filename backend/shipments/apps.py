import os
import threading
from django.apps import AppConfig

class ShipmentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'shipments'

    def ready(self):
        import sys
        if os.getenv('SIMULATE_TELEMETRY', 'false').lower() != 'true':
            return
        if any(command in sys.argv for command in ('migrate', 'test', 'check', 'seed_shipments', 'setup_local', 'bootstrap_admin')):
            return
        is_runserver = 'runserver' in sys.argv
        if not is_runserver or os.environ.get('RUN_MAIN') == 'true':
            from .tasks import broadcast_temperature_loop
            thread = threading.Thread(target=broadcast_temperature_loop, daemon=True)
            thread.start()
