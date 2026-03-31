from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class CSVUpload(models.Model):
    """Track CSV uploads"""
    UPLOAD_TYPE_CHOICES = (
        ('faculty', 'Faculty'),
        ('subject', 'Subject'),
        ('section', 'Section'),
    )
    
    id = models.AutoField(primary_key=True)
    upload_type = models.CharField(max_length=20, choices=UPLOAD_TYPE_CHOICES)
    file_name = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    rows_imported = models.IntegerField(default=0)
    errors = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='pending')  # pending, success, failed
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.upload_type} - {self.file_name} ({self.created_at})"
