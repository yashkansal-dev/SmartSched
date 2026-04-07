# SmartSched - Deployment Checklist & Production Guide

## Pre-Deployment Checklist

### Development Validation ✓
- [ ] Backend starts without errors: `python manage.py runserver`
- [ ] Frontend runs: `npm run dev`
- [ ] Can login with Google
- [ ] Can upload all CSV files (faculty, subject, section)
- [ ] Timetable generation works end-to-end
- [ ] Excel export downloads correctly
- [ ] All API endpoints tested and working
- [ ] No console errors in browser (F12)
- [ ] No errors in backend terminal

### Code Cleanup ✓
- [ ] Remove console.log statements from source code
- [ ] Remove DEBUG=True from backend .env
- [ ] Remove test credentials from frontend
- [ ] Update SECRET_KEY to generate secure key
- [ ] Review and update all .env files
- [ ] Check for hardcoded URLs/ports

### Database Preparation ✓
- [ ] Create production Neon PostgreSQL instance
- [ ] Whitelist production domain IP (usually all allowed)
- [ ] Test connection: `psql <DATABASE_URL>`
- [ ] Run migrations on production database
- [ ] Backup existing data if necessary

### Security Review ✓
- [ ] Update CORS_ALLOWED_ORIGINS to include production domain
- [ ] Set DEBUG = False in production
- [ ] Update ALLOWED_HOSTS to production domain
- [ ] Review database credentials (no public access keys)
- [ ] Set strong SECRET_KEY (50+ random characters)
- [ ] Update Google OAuth redirect URIs in Google Cloud Console

### Configuration Finalization ✓
- [ ] Backend .env configured for production
- [ ] Frontend .env configured for production API URL
- [ ] CSRF_TRUSTED_ORIGINS configured
- [ ] SSL/HTTPS enforced
- [ ] Session settings appropriate for production

---

## Deployment Options

### Option A: Render.com (Recommended for Beginners)

**Time estimate**: 20 minutes

#### Backend Deployment

1. **Connect repository**
   - Push code to GitHub
   - Visit https://render.com and sign in
   - Click "New" → "Web Service"
   - Connect GitHub account
   - Select SmartSched repository

2. **Configure backend service**
   - **Name**: smartsched-backend
   - **Environment**: Python 3.11
   - **Build command**: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
   - **Start command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
   - **Plan**: Free (auto-sleeps) or Paid ($7+/month for always-on)

3. **Set environment variables**
   - Click "Environment" section
   - Add from backend/.env:
     ```
     DATABASE_URL=postgresql://...neon...
     SECRET_KEY=your-secure-key
   VITE_GOOGLE_CLIENT_ID=...
   GOOGLE_OAUTH_CLIENT_SECRET=...
     ALLOWED_HOSTS=*.render.com,yourdomain.com
     DEBUG=False
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build (2-3 minutes)
   - Get URL: https://smartsched-backend.render.com

#### Frontend Deployment

1. **For Netlify** (easiest):
   - Visit https://netlify.com
   - Connect GitHub repository
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - Add environment variable: `VITE_API_BASE_URL=https://smartsched-backend.render.com/api`
   - Deploy

2. **For Vercel**:
   - Visit https://vercel.com
   - Import SmartSched repository
   - Add environment variable: `VITE_API_BASE_URL=https://smartsched-backend.render.com/api`
   - Deploy

---

### Option B: Manual Deployment (Advanced)

For AWS, DigitalOcean, Linode, or custom servers.

#### Backend Setup

```bash
# SSH into server
ssh user@your-server.com

# Install dependencies
sudo apt-get update
sudo apt-get install python3.11 python3-pip postgresql

# Clone repository
git clone https://github.com/yourusername/SmartSched.git
cd SmartSched/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install packages
pip install -r requirements.txt
pip install gunicorn  # WSGI server

# Configure .env
nano .env
# Add all production variables

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start with Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

#### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/smartsched-backend
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    location /static/ {
        alias /home/user/SmartSched/backend/staticfiles/;
    }
}
```

#### SSL/HTTPS (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com

# Update Nginx config
sudo certbot install --nginx

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

#### Process Management (Systemd)

```bash
# Create service file
sudo nano /etc/systemd/system/smartsched.service

[Unit]
Description=SmartSched Application
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/home/user/SmartSched/backend
ExecStart=/home/user/SmartSched/backend/venv/bin/gunicorn config.wsgi:application --bind 0.0.0.0:8000
Restart=on-failure

[Install]
WantedBy=multi-user.target

# Enable service
sudo systemctl enable smartsched
sudo systemctl start smartsched
sudo systemctl status smartsched
```

---

### Option C: Docker Containerization

#### Create Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations and start server
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]

EXPOSE 8000
```

#### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres/smartsched
      DEBUG: "False"
      SECRET_KEY: your-secret-key
    depends_on:
      - postgres
    volumes:
      - ./backend:/app

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: smartsched
      POSTGRES_USER: smartsched_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  frontend:
    build:
      context: .
    ports:
      - "3000:3000"
    environment:
      VITE_API_BASE_URL: http://backend:8000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Deploy with Docker

```bash
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

---

## Production Environment Variables

### Backend (.env)

```env
# Security
DEBUG=False
SECRET_KEY=<generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,smartsched-backend.render.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/smartsched_db

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://frontend-domain.com

# Google OAuth
VITE_GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_OAUTH_CLIENT_SECRET=<from Google Cloud Console>

# Email (optional, for notifications)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Logging
LOG_LEVEL=WARNING
```

### Frontend (.env)

```env
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_GOOGLE_CLIENT_ID=<from Google Cloud Console>
```

---

## Post-Deployment Verification

1. **Test API endpoints**
   ```bash
   curl https://yourdomain.com/api/accounts/
   ```

2. **Check frontend loads**
   - Visit https://yourdomain.com
   - Check console (F12) for errors

3. **Test authentication**
   - Click "Login with Google"
   - Verify redirect to dashboard

4. **Verify SSL certificate**
   - Visit https://yourdomain.com
   - Check lock icon in browser

5. **Monitor performance**
   - Check API response times
   - Monitor database connection pool
   - Watch memory/CPU usage

6. **Set up alerts**
   - Server down notifications
   - Error rate monitoring
   - Performance degradation alerts

---

## Ongoing Maintenance

### Regular Tasks

**Daily:**
- [ ] Monitor error logs
- [ ] Check uptime (use Uptime Robot)
- [ ] Verify backups running

**Weekly:**
- [ ] Review user feedback/error reports
- [ ] Check for security updates
- [ ] Performance metrics review

**Monthly:**
- [ ] Database optimization
- [ ] Update dependencies (`npm update`, `pip list --outdated`)
- [ ] Capacity planning
- [ ] Security audit

### Database Backups

```bash
# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Automated backup (via Neon)
# - Neon includes daily automated backups
# - Set retention period in Neon console

# Restore from backup
psql $DATABASE_URL < backup_20240101.sql
```

### Performance Monitoring

```bash
# Django Debug Toolbar (development only)
pip install django-debug-toolbar

# Error tracking (production)
pip install sentry-sdk

# Add to settings.py:
import sentry_sdk
sentry_sdk.init(dsn="https://your-sentry-dsn@sentry.io/")
```

---

## Update Process

### Deploying Updates

1. **Test locally**
   ```bash
   git checkout develop
   npm install
   python manage.py migrate
   npm run dev
   python manage.py runserver
   ```

2. **Commit and push**
   ```bash
   git add .
   git commit -m "Fix: description"
   git push origin develop
   ```

3. **Auto-deploy** (if using Render/Netlify)
   - Automatic deployment triggered on git push
   - Monitor deploy logs

4. **Manual deploy**
   ```bash
   # On server
   git pull origin main
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py collectstatic --noinput
   systemctl restart smartsched  # if using systemd
   ```

5. **Verify deployment**
   - Check version endpoint
   - Test critical features
   - Monitor error logs

---

## Troubleshooting Deployment

### Application not accessible

```bash
# Check if running
curl http://localhost:8000/api/

# Check port
lsof -i :8000

# Check firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

### Database connection fails

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check credentials
echo $DATABASE_URL

# Verify IP whitelisting (Neon console)
```

### Static files not loading

```bash
# Collect static files
python manage.py collectstatic --clear --noinput

# Check permissions
ls -la staticfiles/

# Verify Nginx config
sudo nginx -t
```

### High memory usage

```bash
# Reduce worker count
gunicorn config.wsgi --workers 2

# Enable memory profiling
pip install memory-profiler
python -m memory_profiler manage.py runserver
```

---

## Rollback Procedure

If deployment fails:

1. **Identify problem**
   ```bash
   # Check recent logs
   tail -50 deployment.log
   ```

2. **Revert code**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Revert database** (if needed)
   ```bash
   # Restore backup
   psql $DATABASE_URL < backup_previous.sql
   ```

4. **Restart service**
   ```bash
   systemctl restart smartsched
   ```

---

## Scaling for Production

**For small deployments (< 10k users):**
- Render.com free tier or $7/month plan
- Neon PostgreSQL free tier
- Single frontend instance

**For medium deployments (10k-100k users):**
- Multiple Gunicorn workers (4-8)
- PostgreSQL connection pooling
- Redis cache for session storage
- CDN for static assets (Cloudflare)

**For large deployments (> 100k users):**
- Kubernetes orchestration
- Database sharding
- Multi-region deployment
- Advanced caching layer
- Load balancing

---

Last updated: 2024
For issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
