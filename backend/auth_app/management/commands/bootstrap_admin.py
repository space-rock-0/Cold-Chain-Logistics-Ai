import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create configured production accounts without resetting credentials"

    def handle(self, *args, **kwargs):
        admin_email = os.getenv("ADMIN_EMAIL")
        admin_password = os.getenv("ADMIN_PASSWORD")
        if not admin_email or not admin_password or len(admin_password) < 16:
            raise CommandError(
                "Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 16 characters"
            )

        User = get_user_model()
        if User.objects.filter(email__iexact=admin_email).exists():
            self.stdout.write("Admin already exists")
        else:
            User.objects.create_superuser(
                username=admin_email,
                email=admin_email,
                password=admin_password,
                role="ADMIN",
            )
            self.stdout.write("Admin created")

        viewer_email = os.getenv("VIEWER_EMAIL")
        viewer_password = os.getenv("VIEWER_PASSWORD")
        if not viewer_email and not viewer_password:
            return
        if not viewer_email or not viewer_password:
            raise CommandError("Set both VIEWER_EMAIL and VIEWER_PASSWORD, or neither")
        if len(viewer_password) < 8:
            raise CommandError("VIEWER_PASSWORD must be at least 8 characters")
        if User.objects.filter(email__iexact=viewer_email).exists():
            self.stdout.write("Viewer already exists")
            return

        User.objects.create_user(
            username=viewer_email,
            email=viewer_email,
            password=viewer_password,
            role="VIEWER",
        )
        self.stdout.write("Viewer created")
