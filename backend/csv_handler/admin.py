from django.contrib import admin
from .models import CSVUpload

@admin.register(CSVUpload)
class CSVUploadAdmin(admin.ModelAdmin):
    list_display = ('upload_type', 'file_name', 'uploaded_by', 'rows_imported', 'status', 'created_at')
    list_filter = ('upload_type', 'status', 'created_at')
    search_fields = ('file_name', 'uploaded_by__username')
    readonly_fields = ('created_at', 'errors')
