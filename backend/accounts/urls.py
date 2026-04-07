from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, google_auth, refresh_token, credential_login, connection_status

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('google/', google_auth, name='google_auth'),
    path('login/', credential_login, name='credential_login'),
    path('refresh/', refresh_token, name='refresh_token'),
    path('connection-status/', connection_status, name='connection_status'),
]

urlpatterns += router.urls
