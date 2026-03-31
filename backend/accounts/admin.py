from django.contrib import admin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'get_full_name', 'role', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ['-created_at']
