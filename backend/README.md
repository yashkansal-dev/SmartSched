# SmartSched Backend Setup Guide

## Overview
This is a Django REST API backend for SmartSched, an AI-powered academic timetable generation system. It handles:
- User authentication (Google OAuth + JWT)
- Faculty, Subject, Section management 
- Timetable generation with constraint satisfaction
- CSV import/export functionality
- PostgreSQL database with Neon

## System Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)            │
│     ├─ Google OAuth Integration         │
│     ├─ CSV Upload Component             │
│     ├─ Timetable Display Grid           │
│     └─ Excel Export                     │
└────────────────────┬────────────────────┘
                     │
          HTTP (axios/fetch)
                     │
        ┌────────────▼────────────┐
        │   Django REST API       │
        │  (port 8000)            │
        ├────────────────────────┤
        │ ├─ /api/auth/          │
        │ │  ├─ google/          │
        │ │  ├─ refresh/         │
        │ │  └─ users/me/        │
        │ ├─ /api/timetable/     │
        │ │  ├─ faculties/       │
        │ │  ├─ subjects/        │
        │ │  ├─ sections/        │
        │ │  ├─ timetable/       │
        │ │  │  ├─ generate/     │
        │ │  │  └─ export/       │
        │ └─ /api/csv/           │
        │    └─ upload/          │
        └────────────────────┬───┘
                             │
                             │
        ┌────────────────────▼────────────┐
        │   PostgreSQL (Neon)              │
        │   Tables:                        │
        │   ├─ auth_user                   │
        │   ├─ accounts_customuser         │
        │   ├─ timetable_faculty           │
        │   ├─ timetable_subject           │
        │   ├─ timetable_section           │
        │   ├─ timetable_timetable         │
        │   └─ csv_handler_csvupload       │
        └─────────────────────────────────┘
```

## Prerequisites

- Python 3.9+
- PostgreSQL/Neon account
- pip (Python package manager)

## Installation

### 1. Clone and Navigate
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@host:port/database

VITE_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-secret

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 5. Run Migrations
```bash
python manage.py migrate
```

### 6. Seed Database
```bash
python manage.py seed_data
```

This creates:
- 5 sample faculties
- 6 sample subjects
- 3 sample sections

### 7. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 8. Run Development Server
```bash
python manage.py runserver
```

Server runs at: `http://localhost:8000`

## API Endpoints

### Authentication
```
POST   /api/auth/google/        - Google OAuth login
POST   /api/auth/refresh/       - Refresh JWT token
GET    /api/auth/users/me/      - Get current user
PUT    /api/auth/users/update_profile/  - Update profile
```

### Faculty Management
```
GET    /api/timetable/faculties/           - List all faculties
POST   /api/timetable/faculties/           - Create faculty
GET    /api/timetable/faculties/{id}/      - Get faculty details
PUT    /api/timetable/faculties/{id}/      - Update faculty
DELETE /api/timetable/faculties/{id}/      - Delete faculty
```

### Subject Management
```
GET    /api/timetable/subjects/            - List all subjects
POST   /api/timetable/subjects/            - Create subject
GET    /api/timetable/subjects/{id}/       - Get subject details
PUT    /api/timetable/subjects/{id}/       - Update subject
DELETE /api/timetable/subjects/{id}/       - Delete subject
```

### Section Management
```
GET    /api/timetable/sections/            - List all sections
POST   /api/timetable/sections/            - Create section
GET    /api/timetable/sections/{id}/       - Get section details
PUT    /api/timetable/sections/{id}/       - Update section
DELETE /api/timetable/sections/{id}/       - Delete section
```

### Timetable
```
GET    /api/timetable/timetable/           - List all timetable slots
POST   /api/timetable/timetable/generate/  - Generate timetable
GET    /api/timetable/timetable/export/    - Export timetable (Excel)
```

### CSV Upload
```
POST   /api/csv/upload/                    - Upload CSV file
```

## Example Requests

### Google OAuth Login
```bash
curl -X POST http://localhost:8000/api/auth/google/ \\
  -H "Content-Type: application/json" \\
  -d '{"token": "<google-id-token>"}'
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "email": "user@example.com",
    "role": "faculty"
  }
}
```

### Generate Timetable
```bash
curl -X POST http://localhost:8000/api/timetable/timetable/generate/ \\
  -H "Authorization: Bearer <access-token>" \\
  -H "Content-Type: application/json" \\
  -d '{"section_id": 1}'
```

Response:
```json
{
  "status": "success",
  "message": "Generated 18 timetable slots",
  "total_scheduled": 6,
  "conflicts": [],
  "timetable": [...]
}
```

### Upload CSV
```bash
curl -X POST http://localhost:8000/api/csv/upload/ \\
  -H "Authorization: Bearer <access-token>" \\
  -F "file=@faculties.csv" \\
  -F "upload_type=faculty"
```

## Database Schema

### CustomUser
```sql
- id (PK)
- username
- email
- first_name
- last_name
- role (tt_coordinator, faculty, student, exam_incharge, hod, principal)
- department
- phone
- created_at
- updated_at
```

### Faculty
```sql
- id (PK)
- name (unique)
- email (unique)
- department
- max_hours_per_week
- created_at
- updated_at
```

### Subject
```sql
- id (PK)
- name
- code (unique)
- subject_type (theory/lab)
- hours_per_week
- faculty_id (FK)
- created_at
- updated_at
```

### Section
```sql
- id (PK)
- name (unique)
- semester
- total_students
- created_at
- updated_at
```

### Timetable
```sql
- id (PK)
- section_id (FK)
- subject_id (FK)
- faculty_id (FK)
- day (monday-friday)
- time_slot
- room
- created_at
- updated_at

Unique Constraints:
- (section, day, time_slot)
- (faculty, day, time_slot)
- (room, day, time_slot)
```

## Timetable Generation Algorithm

The algorithm uses a **greedy constraint satisfaction approach**:

1. **Collect all subjects** to be scheduled
2. **For each subject:**
   - Find available faculty (within max hours)
   - Find available day/time slot
   - Check constraints:
     - Faculty not already teaching
     - Section not already scheduled
     - Room not already booked
   - If valid, create timetable entry
   - If conflicts, record them

**Time Complexity**: O(S × F × D × T)
- S = subjects
- F = faculties
- D = days
- T = time slots

**Constraints Enforced:**
- ✓ No faculty double-booking
- ✓ No section double-booking
- ✓ No room double-booking
- ✓ Faculty max hours/week
- ✓ Subject hours matching

## Testing

### Run Tests
```bash
python manage.py test
```

### Test Specific App
```bash
python manage.py test accounts
python manage.py test timetable
python manage.py test csv_handler
```

## Admin Panel

Access Django admin at: `http://localhost:8000/admin/`

Login with superuser credentials created earlier.

Manage:
- Users and roles
- Faculties & Subjects
- Sections & Timetables
- CSV Upload history

## Deployment

### Production Settings
Update `.env` for production:

```env
DEBUG=False
SECRET_KEY=<generate-new-secret>
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
DATABASE_URL=<production-neon-url>
```

### Collect Static Files
```bash
python manage.py collectstatic --noinput
```

### Run with Gunicorn
```bash
pip install gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

### Docker Deployment
```bash
docker build -t smartsched-backend .
docker run -p 8000:8000 smartsched-backend
```

## Troubleshooting

### Database Connection Error
- Verify DATABASE_URL is correct
- Check network access to Neon
- Ensure SSL certificates are valid

### Migration Errors
```bash
python manage.py migrate --fake-initial
python manage.py migrate
```

### Static Files Not Loading
```bash
python manage.py collectstatic --clear --noinput
```

### CORS Issues
- Update CORS_ALLOWED_ORIGINS in settings
- Restart server

## Support

For issues or questions:
1. Check logs: `python manage.py runserver 2>&1 | tee debug.log`
2. Review API docs at: `http://localhost:8000/api/`
3. Check admin panel: `http://localhost:8000/admin/`

---

**Last Updated**: March 2026  
**Version**: 1.0.0
