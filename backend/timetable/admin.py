from django.contrib import admin
from .models import Faculty, Subject, Section, Timetable

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'department', 'max_hours_per_week', 'created_at')
    list_filter = ('department', 'created_at')
    search_fields = ('name', 'email', 'department')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'subject_type', 'hours_per_week', 'faculty', 'created_at')
    list_filter = ('subject_type', 'created_at')
    search_fields = ('name', 'code', 'faculty__name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'semester', 'total_students', 'created_at')
    list_filter = ('semester', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = ('section', 'subject', 'faculty', 'day', 'time_slot', 'room', 'created_at')
    list_filter = ('day', 'section', 'created_at')
    search_fields = ('section__name', 'subject__code', 'faculty__name')
    readonly_fields = ('created_at', 'updated_at')
