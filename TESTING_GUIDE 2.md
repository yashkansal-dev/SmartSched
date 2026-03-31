# SmartSched - Testing & Validation Guide

This guide will help you verify the complete SmartSched system end-to-end.

## Prerequisites

Before starting, ensure you have:
- Python 3.9+ installed (`python --version`)
- Node.js 16+ installed (`node --version`)
- Git and a code editor (VS Code recommended)
- A Neon PostgreSQL account (free tier available)
- Google OAuth credentials (from Google Cloud Console)

---

## Phase 1: Backend Setup (15 minutes)

### 1.1 Configure Environment

```bash
# Navigate to backend directory
cd backend

# Create .env file
cat > .env << EOF
DEBUG=True
SECRET_KEY=your-dev-secret-key-here-min-50-chars
DATABASE_URL=postgresql://user:password@host/dbname
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ALLOWED_HOSTS=localhost,127.0.0.1
EOF
```

**Get your credentials:**
- **DATABASE_URL**: Create Neon PostgreSQL account → Create project → Copy connection string
- **Google OAuth**: Google Cloud Console → Create project → Create OAuth 2.0 ID → Copy credentials

### 1.2 Install & Initialize Database

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed sample data
python manage.py seed_data

# Create superuser (optional, for admin panel)
python manage.py createsuperuser
```

### 1.3 Start Backend Server

```bash
python manage.py runserver

# Expected output:
# Starting development server at http://127.0.0.1:8000/
# Check http://127.0.0.1:8000/admin/ in browser
```

✅ **Checkpoint 1**: Backend should be running without errors.

---

## Phase 2: Frontend Setup (10 minutes)

### 2.1 Configure Environment

```bash
# Navigate to project root (where package.json is)

# Create/update .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
EOF
```

### 2.2 Install Dependencies & Start Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Expected output:
#   ➜  Local:   http://localhost:5173/
#   ➜  press h + enter to show help
```

✅ **Checkpoint 2**: Frontend should be accessible at http://localhost:5173/

---

## Phase 3: Feature Testing

### Test 3.1: Authentication - Google Login

**Steps:**
1. Open http://localhost:5173/ in browser
2. Click "Login with Google" button
3. Sign in with your Google account
4. Verify redirected to Dashboard

**Expected Results:**
- ✅ Login button becomes active
- ✅ User name displayed in header
- ✅ Access token stored in localStorage (open DevTools → Application → localStorage)
- ✅ Can navigate to other pages

**Troubleshooting:**
- If "Google login failed" appears: Check GOOGLE_CLIENT_ID in both .env files
- If blank redirect: Check CORS_ALLOWED_ORIGINS in backend/config/settings.py includes http://localhost:5173
- Check browser console for error details

### Test 3.2: CSV Import - Upload Faculty Data

**Steps:**
1. Navigate to Dashboard (left sidebar)
2. Find "Manage Faculty" section or go to Settings
3. Click "Upload CSV" button
4. Select [backend/sample_data/faculties.csv](backend/sample_data/faculties.csv)
5. Verify success message shows

**Expected Results:**
- ✅ File accepts only .csv format
- ✅ Success message: "Successfully imported 8 records"
- ✅ Database contains new faculty (verify via Django admin http://localhost:8000/admin/)

**Expected CSV columns:**
```
name, email, department, max_hours_per_week
```

**Sample data uploaded:**
- 8 faculty members
- Departments: Computer Science, Information Technology, Mathematics
- Hours range: 20-24 hours/week

**Troubleshooting:**
- If "File validation failed": Check CSV is plain text, not Excel-formatted
- If column errors: Verify header names match exactly (case-sensitive)
- Check backend/timetable/utils.py parse_faculty_csv() for expected columns

### Test 3.3: CSV Import - Upload Subjects

**Steps:**
1. Go to Timetable Generation page (left sidebar)
2. Find "Upload Subjects" or Settings section
3. Select [backend/sample_data/subjects.csv](backend/sample_data/subjects.csv)
4. Verify import completes

**Expected Results:**
- ✅ "Successfully imported 10 records"
- ✅ Subjects linked to faculty correctly

**Expected CSV columns:**
```
name, code, subject_type, hours_per_week, faculty_email
```

**Note:** faculty_email must match existing faculty from previous import

### Test 3.4: CSV Import - Upload Sections

**Steps:**
1. Upload [backend/sample_data/sections.csv](backend/sample_data/sections.csv)
2. Verify success message

**Expected Results:**
- ✅ "Successfully imported 6 records"
- ✅ 6 sections created in database

**Expected CSV columns:**
```
name, semester, total_students
```

### Test 3.5: Timetable Generation

**Steps:**
1. Navigate to "Timetable Generation" page
2. Select section from dropdown (e.g., "CSE-3A")
3. Click "Generate Timetable" button
4. Wait 2-5 seconds for generation

**Expected Results:**
- ✅ Timetable appears showing day/time slots
- ✅ Each slot has: Faculty name, Subject code, Room number
- ✅ No conflicts:
  - Same faculty not in multiple places at same time
  - Same room not double-booked
  - Section not in multiple classes simultaneously
- ✅ All subjects for section appear in schedule

**Algorithm Info:**
- Uses greedy constraint satisfaction solver
- Schedules: ~30 slots per section
- Time slots: 2+ hours each (9AM-5PM with breaks)
- Rooms: Lab1, Lab2, Lab3, Lecture1, Lecture2, Lecture3

**Performance:**
- Generation time: 1-3 seconds
- If >30 seconds: Check database connectivity

### Test 3.6: Excel Export

**Steps:**
1. With timetable displayed, click "Export to Excel" button
2. File downloads as "timetable_CSE-3A.xlsx" (or similar)
3. Open file in Excel/LibreOffice

**Expected Results:**
- ✅ File downloads without errors
- ✅ Excel contains properly formatted table
- ✅ Headers: Day, Time Slot, Faculty, Subject, Room, Semester, Section
- ✅ Data matches web display
- ✅ Colors/formatting applied

**Common Issue:**
- If blank file downloads: Check openpyxl is installed (`pip list | grep openpyxl`)

### Test 3.7: Analytics (Optional)

**Steps:**
1. Navigate to "Analytics" page
2. Observe visualization and key metrics

**Expected Results:**
- ✅ Faculty load distribution chart displays
- ✅ Subject coverage metrics show
- ✅ Room utilization visible

---

## Phase 4: API Testing (Advanced)

Use curl or Postman to test API directly.

### Create API requests file (`requests.http` or use Postman)

```http
### 1. Google Authentication
POST http://localhost:8000/api/accounts/google-auth/
Content-Type: application/json

{
  "token": "GOOGLE_ID_TOKEN_HERE"
}

### 2. Get All Faculties
GET http://localhost:8000/api/timetable/faculties/
Authorization: Bearer YOUR_ACCESS_TOKEN

### 3. Generate Timetable
POST http://localhost:8000/api/timetable/timetable/generate/
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "section_id": 1
}

### 4. Export Timetable
GET http://localhost:8000/api/timetable/timetable/export/?section_id=1
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Install tools:**
```bash
# Using VS Code REST Client extension
# Or use curl:
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/timetable/faculties/
```

---

## Phase 5: Database Inspection

### View data in Django Admin

```bash
# Start Django shell
python manage.py shell

# List all tasks
from timetable.models import Faculty, Subject, Section, Timetable

print(f"Faculties: {Faculty.objects.count()}")
print(f"Subjects: {Subject.objects.count()}")
print(f"Sections: {Section.objects.count()}")
print(f"Timetable slots: {Timetable.objects.count()}")

# Get specific data
for faculty in Faculty.objects.all():
    print(f"{faculty.name} - {faculty.department}")

exit()
```

### Admin Panel

1. Navigate to http://localhost:8000/admin/
2. Login with superuser credentials (created in setup)
3. Browse:
   - Users (Authentication and Authorization)
   - Faculties
   - Subjects
   - Sections
   - Timetables

---

## Validation Checklist

Use this checklist to verify all features work:

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:5173
- [ ] Google Login button appears and functional
- [ ] Can upload faculty CSV (8 records imported)
- [ ] Can upload subjects CSV (10 records imported)
- [ ] Can upload sections CSV (6 records imported)
- [ ] Can select section and generate timetable
- [ ] Timetable displays without conflicts
- [ ] Excel export downloads and opens correctly
- [ ] Analytics dashboard displays metrics
- [ ] API endpoints respond with proper JSON
- [ ] Database contains all imported data
- [ ] No console errors in browser DevTools
- [ ] No server errors in terminal

---

## Common Issues & Solutions

### Issue: "Cannot POST /api/accounts/google-auth/"

**Solution:**
```bash
# Check API is accessible
curl http://localhost:8000/api/
# Should return empty response, not 404

# Verify INSTALLED_APPS in config/settings.py includes accounts
grep -n "accounts" backend/config/settings.py
```

### Issue: "CORS error: Access-Control-Allow-Origin"

**Solution:**
```python
# In backend/config/settings.py, update:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # Add if using different port
]
```

### Issue: "ModuleNotFoundError: No module named 'google'"

**Solution:**
```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

### Issue: "ProgrammingError: relation 'auth_user' does not exist"

**Solution:**
```bash
# Migrations not applied
python manage.py migrate
python manage.py seed_data
```

### Issue: "Timetable generation takes >30 seconds"

**Solution:**
```bash
# Check database connectivity
python manage.py shell
from django.db import connections
print(connections.databases['default'])
# Should show your Neon connection

# If slow, verify Neon URL is correct
cat backend/.env | grep DATABASE_URL
```

### Issue: "Google login redirects to blank page"

**Solution:**
1. Check browser DevTools → Network tab
2. Look for failed requests to /api/accounts/google-auth/
3. Verify GOOGLE_CLIENT_ID matches Google Cloud Console
4. Check backend logs for error details

---

## Performance Benchmarks

Expected timings on standard laptop:

| Operation | Time |
|-----------|------|
| Page load | <1s |
| Google login | 2-3s |
| CSV import (10 records) | 1-2s |
| Timetable generation | 2-5s |
| Excel export | 1-2s |
| API response | <500ms |

If significantly slower, check database connectivity and network latency.

---

## Next Steps After Validation

1. **Deploy Backend**: Follow [SETUP_GUIDE.md - Deployment](SETUP_GUIDE.md#deployment)
2. **Deploy Frontend**: Deploy to Netlify/Vercel with updated API_BASE_URL
3. **Monitor**: Set up error tracking (Sentry recommended)
4. **Optimize**: Profile slow areas with Django Debug Toolbar

---

## Getting Help

**Check logs:**
```bash
# Backend logs
tail -f backend/debug.log  # If configured

# Frontend logs (DevTools)
F12 → Console tab

# Database logs (Neon)
https://console.neon.tech → Your project → Logs tab
```

**Debug single requests:**
```bash
# Enable debug logging
python manage.py runserver --debug

# Or add to backend/.env
DEBUG=True
```

---

## Sample Data Overview

The system includes pre-configured sample data:

**Faculties (8):**
- Dr. Sarah Johnson, Prof. Michael Chen, Dr. Emily Davis, Prof. David Wilson
- Dr. Lisa Zhang, Prof. James Brown, Dr. Amanda Miller, Prof. Robert Taylor

**Subjects (10):**
- Database Management, Computer Networks, Web Development, Data Structures
- Software Engineering, Artificial Intelligence, Operating Systems, Web Security
- Discrete Mathematics, Advanced Algorithms

**Sections (6):**
- CSE-3A, CSE-3B (3rd semester, 48-50 students)
- IT-4A, IT-4B (4th semester, 42-45 students)
- CSE-2A (2nd semester, 52 students)
- ECE-3A (3rd semester, 38 students)

Generated timetables will automatically balance these across available time slots with no conflicts.

---

Last updated: 2024
For issues or questions, check the main [SETUP_GUIDE.md](SETUP_GUIDE.md)
