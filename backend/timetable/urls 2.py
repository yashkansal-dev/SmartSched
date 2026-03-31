from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import FacultyViewSet, SubjectViewSet, SectionViewSet, TimetableViewSet

router = DefaultRouter()
router.register(r'faculties', FacultyViewSet, basename='faculty')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'timetable', TimetableViewSet, basename='timetable')

urlpatterns = router.urls
