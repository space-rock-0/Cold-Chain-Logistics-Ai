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
            admin = User.objects.create_superuser(
                username=admin_email,
                email=admin_email,
                role="ADMIN",
            )
            admin.set_password(admin_password)
            admin.save(update_fields=["password"])
            self.stdout.write("Admin created")

        viewer_email = os.getenv("VIEWER_EMAIL", "viewer@coldchain.com")
        viewer_password = os.getenv("VIEWER_PASSWORD", "viewer123")
        if len(viewer_password) < 8:
            raise CommandError("VIEWER_PASSWORD must be at least 8 characters")
        viewer = User.objects.filter(email__iexact=viewer_email).first()
        if viewer:
            viewer.set_password(viewer_password)
            viewer.role = "VIEWER"
            viewer.save(update_fields=["password", "role"])
            self.stdout.write("Viewer password synchronized")
            return

        viewer = User.objects.create_user(
            username=viewer_email,
            email=viewer_email,
            role="VIEWER",
        )
        viewer.set_password(viewer_password)
        viewer.save(update_fields=["password"])
        self.stdout.write("Viewer created")
