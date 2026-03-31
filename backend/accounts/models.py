from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now

class CustomUser(AbstractUser):
    """Custom User model with role-based access"""
    
    ROLE_CHOICES = (
        ('tt_coordinator', 'TT Coordinator'),
        ('faculty', 'Faculty'),
        ('student', 'Student'),
        ('exam_incharge', 'Exam In-Charge'),
        ('hod', 'HOD'),
        ('principal', 'Principal'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='faculty')
    department = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
