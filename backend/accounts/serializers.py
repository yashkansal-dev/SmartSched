from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
import google.auth.transport.requests
from google.oauth2 import id_token
import os

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'department', 'phone', 'created_at']
        read_only_fields = ['id', 'created_at']

class GoogleAuthSerializer(serializers.Serializer):
    """Validate Google OAuth token and return JWT"""
    token = serializers.CharField(max_length=2000)
    
    def validate_token(self, value):
        try:
            # Verify Google token
            idinfo = id_token.verify_oauth2_token(
                value,
                google.auth.transport.requests.Request(),
                os.getenv('VITE_GOOGLE_CLIENT_ID')
            )
            
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
            
            return idinfo
        except Exception as e:
            raise serializers.ValidationError(f"Invalid token: {str(e)}")
    
    def create(self, validated_data):
        """Create or update user from Google token"""
        idinfo = validated_data['token']
        
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'first_name': first_name,
                'last_name': last_name,
                'role': 'faculty',  # Default role
            }
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    """Validate credential-based login using email + password"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError('Email and password are required.')

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            raise serializers.ValidationError('Invalid email or password.')

        authenticated_user = authenticate(
            username=user.username,
            password=password,
        )

        if not authenticated_user:
            raise serializers.ValidationError('Invalid email or password.')

        if not authenticated_user.is_active:
            raise serializers.ValidationError('This account is disabled.')

        attrs['user'] = authenticated_user
        return attrs

class JWTTokenSerializer(serializers.Serializer):
    """Return JWT tokens for authenticated user"""
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)
