from django.db import migrations


def create_default_admin(apps, schema_editor):
    from django.conf import settings
    if not settings.LOCAL_MODE:
        return
    from django.contrib.auth import get_user_model

    User = get_user_model()
    username = "admin"
    password = "admin123"

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            password=password,
            email="admin@example.com",
        )


class Migration(migrations.Migration):
    dependencies = [
        ("auth_app", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_default_admin, migrations.RunPython.noop),
    ]
