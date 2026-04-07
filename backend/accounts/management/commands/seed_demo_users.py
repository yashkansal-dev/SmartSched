import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Seed demo users for each SmartSched role.'

    def handle(self, *args, **options):
        User = get_user_model()
        default_password = os.getenv('DEMO_DEFAULT_PASSWORD', 'demo123')

        demo_users = [
            {
                'username': 'coordinator_demo',
                'email': 'coordinator@smartsched.edu',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'role': 'tt_coordinator',
                'department': 'Computer Science',
                'phone': '+1-555-0101',
            },
            {
                'username': 'faculty_demo',
                'email': 'faculty@smartsched.edu',
                'first_name': 'Michael',
                'last_name': 'Chen',
                'role': 'faculty',
                'department': 'Computer Science',
                'phone': '+1-555-0102',
            },
            {
                'username': 'student_demo',
                'email': 'student@smartsched.edu',
                'first_name': 'John',
                'last_name': 'Smith',
                'role': 'student',
                'department': 'Computer Science',
                'phone': '+1-555-0103',
            },
            {
                'username': 'examiner_demo',
                'email': 'examiner@smartsched.edu',
                'first_name': 'Emily',
                'last_name': 'Davis',
                'role': 'exam_incharge',
                'department': 'Computer Science',
                'phone': '+1-555-0104',
            },
            {
                'username': 'hod_demo',
                'email': 'hod@smartsched.edu',
                'first_name': 'David',
                'last_name': 'Wilson',
                'role': 'hod',
                'department': 'Computer Science',
                'phone': '+1-555-0105',
            },
            {
                'username': 'principal_demo',
                'email': 'principal@smartsched.edu',
                'first_name': 'Lisa',
                'last_name': 'Zhang',
                'role': 'principal',
                'department': 'Administration',
                'phone': '+1-555-0106',
            },
        ]

        created_count = 0
        updated_count = 0

        for payload in demo_users:
            email = payload['email']
            user = User.objects.filter(email__iexact=email).first()

            if user is None:
                user = User.objects.create_user(**payload)
                created_count += 1
                action = 'created'
            else:
                for field, value in payload.items():
                    setattr(user, field, value)
                updated_count += 1
                action = 'updated'

            user.set_password(default_password)
            user.is_active = True
            user.save()

            self.stdout.write(self.style.SUCCESS(f"{action.upper()}: {email} ({payload['role']})"))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('Demo users seed complete.'))
        self.stdout.write(f'Created: {created_count}')
        self.stdout.write(f'Updated: {updated_count}')
        self.stdout.write('Password for all demo users: ' + default_password)
