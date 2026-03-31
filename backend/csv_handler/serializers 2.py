from rest_framework import serializers

class CSVUploadSerializer(serializers.Serializer):
    """Serializer for CSV file upload"""
    file = serializers.FileField()
    upload_type = serializers.ChoiceField(choices=['faculty', 'subject', 'section'])
