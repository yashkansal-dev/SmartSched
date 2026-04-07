from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.permissions import MANAGEMENT_ROLES, user_has_role
from .serializers import CSVUploadSerializer
from .models import CSVUpload
from .utils import CSVParser

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_csv(request):
    """
    Upload and parse CSV file
    
    POST /api/csv/upload/
    {
        "file": <file>,
        "upload_type": "faculty|subject|section"
    }
    """
    serializer = CSVUploadSerializer(data=request.data)

    if not user_has_role(request.user, MANAGEMENT_ROLES):
        return Response(
            {'error': 'You do not have permission to upload CSV data.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    file_obj = serializer.validated_data['file']
    upload_type = serializer.validated_data['upload_type']
    
    # Store upload record
    csv_upload = CSVUpload.objects.create(
        upload_type=upload_type,
        file_name=file_obj.name,
        uploaded_by=request.user,
        status='pending'
    )
    
    try:
        # Parse based on type
        if upload_type == 'faculty':
            result = CSVParser.parse_faculty_csv(file_obj)
        elif upload_type == 'subject':
            result = CSVParser.parse_subject_csv(file_obj)
        elif upload_type == 'section':
            result = CSVParser.parse_section_csv(file_obj)
        else:
            raise ValueError("Invalid upload type")
        
        # Update CSV upload record
        csv_upload.rows_imported = result['success']
        csv_upload.errors = '\n'.join(result['errors']) if result['errors'] else None
        csv_upload.status = 'success' if result['success'] > 0 else 'failed'
        csv_upload.save()
        
        return Response({
            'status': 'success',
            'message': f"Successfully imported {result['success']} {upload_type} entries",
            'imported': result['success'],
            'total': result['total'],
            'errors': result['errors'],
            'upload_id': csv_upload.id
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        csv_upload.status = 'failed'
        csv_upload.errors = str(e)
        csv_upload.save()
        
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
