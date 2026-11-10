from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.conf import settings

class Command(BaseCommand):
    help = 'Create development users in local mode only'
    def handle(self, *args, **kwargs):
        if not settings.LOCAL_MODE:
            raise CommandError('Requires LOCAL_MODE=true')
        for username, role, password in [('admin','ADMIN','admin123'), ('viewer','VIEWER','viewer123')]:
            user, created = get_user_model().objects.get_or_create(username=username)
            user.email = username + '@coldchain.com'
            user.role = role
            if created or not user.has_usable_password(): user.set_password(password)
            user.save()
        self.stdout.write('Local users ready')
