from django.core.management.base import BaseCommand
from timetable.models import Faculty, Subject, Section

class Command(BaseCommand):
    help = 'Seed database with initial data'
    
    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding database...")
        
        # Create Faculties
        faculties_data = [
            {
                'name': 'Dr. Sarah Johnson',
                'email': 'sarah.johnson@university.edu',
                'department': 'Computer Science',
                'max_hours_per_week': 24
            },
            {
                'name': 'Prof. Michael Chen',
                'email': 'michael.chen@university.edu',
                'department': 'Computer Science',
                'max_hours_per_week': 24
            },
            {
                'name': 'Dr. Emily Davis',
                'email': 'emily.davis@university.edu',
                'department': 'Information Technology',
                'max_hours_per_week': 24
            },
            {
                'name': 'Prof. David Wilson',
                'email': 'david.wilson@university.edu',
                'department': 'Computer Science',
                'max_hours_per_week': 24
            },
            {
                'name': 'Dr. Lisa Zhang',
                'email': 'lisa.zhang@university.edu',
                'department': 'Information Technology',
                'max_hours_per_week': 24
            },
        ]
        
        faculties = []
        for faculty_data in faculties_data:
            faculty, created = Faculty.objects.get_or_create(
                email=faculty_data['email'],
                defaults=faculty_data
            )
            faculties.append(faculty)
            if created:
                self.stdout.write(f"✓ Created Faculty: {faculty.name}")
        
        # Create Subjects
        subjects_data = [
            {
                'name': 'Database Management',
                'code': 'CS301',
                'subject_type': 'theory',
                'hours_per_week': 4,
                'faculty_email': 'sarah.johnson@university.edu'
            },
            {
                'name': 'Computer Networks',
                'code': 'CS302',
                'subject_type': 'theory',
                'hours_per_week': 4,
                'faculty_email': 'michael.chen@university.edu'
            },
            {
                'name': 'Web Development',
                'code': 'IT401',
                'subject_type': 'lab',
                'hours_per_week': 6,
                'faculty_email': 'emily.davis@university.edu'
            },
            {
                'name': 'Data Structures',
                'code': 'CS201',
                'subject_type': 'theory',
                'hours_per_week': 4,
                'faculty_email': 'david.wilson@university.edu'
            },
            {
                'name': 'Software Engineering',
                'code': 'CS401',
                'subject_type': 'lab',
                'hours_per_week': 6,
                'faculty_email': 'lisa.zhang@university.edu'
            },
            {
                'name': 'Artificial Intelligence',
                'code': 'CS501',
                'subject_type': 'theory',
                'hours_per_week': 3,
                'faculty_email': 'sarah.johnson@university.edu'
            },
        ]
        
        for subject_data in subjects_data:
            faculty_email = subject_data.pop('faculty_email')
            faculty = Faculty.objects.get(email=faculty_email)
            
            subject, created = Subject.objects.get_or_create(
                code=subject_data['code'],
                defaults={**subject_data, 'faculty': faculty}
            )
            if created:
                self.stdout.write(f"✓ Created Subject: {subject.name}")
        
        # Create Sections
        sections_data = [
            {'name': 'CSE-3A', 'semester': 3, 'total_students': 50},
            {'name': 'CSE-3B', 'semester': 3, 'total_students': 48},
            {'name': 'IT-4A', 'semester': 4, 'total_students': 45},
        ]
        
        for section_data in sections_data:
            section, created = Section.objects.get_or_create(
                name=section_data['name'],
                defaults=section_data
            )
            if created:
                self.stdout.write(f"✓ Created Section: {section.name}")
        
        self.stdout.write(self.style.SUCCESS("✅ Database seeding complete!"))
