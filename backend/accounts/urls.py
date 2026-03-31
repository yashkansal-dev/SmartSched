from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, google_auth, refresh_token

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('google/', google_auth, name='google_auth'),
    path('refresh/', refresh_token, name='refresh_token'),
]

urlpatterns += router.urls
