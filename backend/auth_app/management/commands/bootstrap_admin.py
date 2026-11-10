import os
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

class Command(BaseCommand):
    help = 'Create the initial production admin without resetting existing credentials'
    def handle(self, *args, **kwargs):
        email = os.getenv('ADMIN_EMAIL')
        password = os.getenv('ADMIN_PASSWORD')
        if not email or not password or len(password) < 16:
            raise CommandError('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 16 characters')
        User = get_user_model()
        if User.objects.filter(email__iexact=email).exists():
            self.stdout.write('Admin already exists')
            return
        User.objects.create_superuser(username=email, email=email, password=password, role='ADMIN')
        self.stdout.write('Admin created')
