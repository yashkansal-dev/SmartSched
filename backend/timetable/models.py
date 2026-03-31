from django.db import models
from django.db.models import UniqueConstraint

class Faculty(models.Model):
    """Faculty model"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)
    max_hours_per_week = models.IntegerField(default=24)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Faculties'
    
    def __str__(self):
        return f"{self.name} ({self.department})"

class Subject(models.Model):
    """Subject model"""
    SUBJECT_TYPE_CHOICES = (
        ('theory', 'Theory'),
        ('lab', 'Lab/Practical'),
    )
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    subject_type = models.CharField(max_length=10, choices=SUBJECT_TYPE_CHOICES)
    hours_per_week = models.IntegerField()
    faculty = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, related_name='subjects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['code']
        constraints = [
            UniqueConstraint(fields=['name', 'code'], name='unique_subject_name_code')
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class Section(models.Model):
    """Section/Class model"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)  # e.g., "CSE-3A"
    semester = models.IntegerField()
    total_students = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Timetable(models.Model):
    """Timetable slot model"""
    DAY_CHOICES = (
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
    )
    
    TIME_SLOT_CHOICES = (
        ('09:00-10:00', '09:00 - 10:00'),
        ('10:00-11:00', '10:00 - 11:00'),
        ('11:30-12:30', '11:30 - 12:30'),
        ('12:30-13:30', '12:30 - 13:30'),
        ('14:30-15:30', '14:30 - 15:30'),
        ('15:30-16:30', '15:30 - 16:30'),
    )
    
    id = models.AutoField(primary_key=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='timetable_slots')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    faculty = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True)
    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    time_slot = models.CharField(max_length=20, choices=TIME_SLOT_CHOICES)
    room = models.CharField(max_length=50, default='Room 101')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['day', 'time_slot']
        constraints = [
            UniqueConstraint(
                fields=['section', 'day', 'time_slot'],
                name='unique_section_slot'
            ),
            UniqueConstraint(
                fields=['faculty', 'day', 'time_slot'],
                name='unique_faculty_slot'
            ),
            UniqueConstraint(
                fields=['room', 'day', 'time_slot'],
                name='unique_room_slot'
            ),
        ]
    
    def __str__(self):
        return f"{self.section} - {self.subject} ({self.day} {self.time_slot})"
