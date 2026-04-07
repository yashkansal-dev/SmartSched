from django.db import migrations, models


def normalize_and_dedupe_emails(apps, schema_editor):
    User = apps.get_model('accounts', 'CustomUser')

    seen = set()

    for user in User.objects.all().order_by('id'):
        raw_email = (user.email or '').strip().lower()

        if '@' in raw_email:
            local, domain = raw_email.split('@', 1)
            local = local or f'user{user.id}'
            domain = domain or 'smartsched.local'
        else:
            local = (user.username or f'user{user.id}').strip().lower() or f'user{user.id}'
            domain = 'smartsched.local'

        base_local = ''.join(ch for ch in local if not ch.isspace()) or f'user{user.id}'
        candidate = f'{base_local}@{domain}'

        dedupe_index = 1
        while candidate in seen:
            candidate = f'{base_local}+dup{dedupe_index}@{domain}'
            dedupe_index += 1

        seen.add(candidate)

        if user.email != candidate:
            user.email = candidate
            user.save(update_fields=['email'])


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(normalize_and_dedupe_emails, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='customuser',
            name='email',
            field=models.EmailField(max_length=254, unique=True),
        ),
    ]
