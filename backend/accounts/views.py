from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db import connections
from django.db.utils import OperationalError
from django.utils import timezone

from .serializers import UserSerializer, GoogleAuthSerializer, LoginSerializer
from .permissions import RoleBasedAccessPermission, MANAGEMENT_ROLES, ALL_ROLES, user_has_role

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """User management endpoints"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, RoleBasedAccessPermission]
    allowed_roles_by_action = {
        'list': MANAGEMENT_ROLES,
        'create': MANAGEMENT_ROLES,
        'retrieve': MANAGEMENT_ROLES,
        'update': MANAGEMENT_ROLES,
        'partial_update': MANAGEMENT_ROLES,
        'destroy': MANAGEMENT_ROLES,
        'me': ALL_ROLES,
        'update_profile': ALL_ROLES,
    }
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        """Update current user profile"""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def google_auth(request):
    """
    Google OAuth authentication endpoint
    
    POST /api/auth/google/
    {
        "token": "<google_id_token>"
    }
    """
    serializer = GoogleAuthSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user = serializer.save()
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    response_data = {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    }
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['POST'])
def credential_login(request):
    """
    Credential authentication endpoint

    POST /api/auth/login/
    {
        "email": "faculty@smartsched.edu",
        "password": "demo123"
    }
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.validated_data['user']
    refresh = RefreshToken.for_user(user)

    return Response(
        {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def connection_status(request):
    """Validate backend <-> database connectivity and return quick auth stats."""
    if not user_has_role(request.user, MANAGEMENT_ROLES):
        return Response(
            {'error': 'You do not have permission to view connection status.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    db_connected = False
    db_error = None

    try:
        with connections['default'].cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
        db_connected = True
    except OperationalError as error:
        db_error = str(error)

    role_counts = {
        role: User.objects.filter(role=role).count()
        for role, _label in User.ROLE_CHOICES
    } if db_connected else {}

    response = {
        'backend': 'ok',
        'database': 'connected' if db_connected else 'disconnected',
        'auth_users_total': User.objects.count() if db_connected else 0,
        'role_counts': role_counts,
        'timestamp': timezone.now().isoformat(),
    }

    if db_error:
        response['database_error'] = db_error

    status_code = status.HTTP_200_OK if db_connected else status.HTTP_503_SERVICE_UNAVAILABLE
    return Response(response, status=status_code)

@api_view(['POST'])
def refresh_token(request):
    """
    Refresh JWT token
    
    POST /api/auth/refresh/
    {
        "refresh": "<refresh_token>"
    }
    """
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response(
            {'error': 'Refresh token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_401_UNAUTHORIZED
        )
