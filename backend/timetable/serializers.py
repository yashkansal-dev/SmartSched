from rest_framework import serializers
from .models import Faculty, Subject, Section, Timetable

class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ['id', 'name', 'email', 'department', 'max_hours_per_week', 'created_at']
        read_only_fields = ['id', 'created_at']

class SubjectSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'subject_type', 'hours_per_week', 'faculty', 'faculty_name', 'created_at']
        read_only_fields = ['id', 'created_at']

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'name', 'semester', 'total_students', 'created_at']
        read_only_fields = ['id', 'created_at']

class TimetableSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(source='section.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    
    class Meta:
        model = Timetable
        fields = [
            'id', 'section', 'section_name', 'subject', 'subject_name', 'subject_code',
            'faculty', 'faculty_name', 'day', 'time_slot', 'room', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class TimetableGenerationSerializer(serializers.Serializer):
    """Serializer for timetable generation request"""
    section_id = serializers.IntegerField()
    
    def validate_section_id(self, value):
        if not Section.objects.filter(id=value).exists():
            raise serializers.ValidationError("Section not found")
        return value
