#!/bin/bash

# SmartSched Backend Setup Script
# This script initializes the Django project

set -e

echo "🚀 SmartSched Backend Setup"
echo "=============================="

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate
echo "✓ Virtual environment activated"

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
echo "✓ Dependencies installed"

# Run migrations
echo "🗄️  Running migrations..."
python manage.py migrate

# Create superuser prompt
echo ""
echo "👤 Create superuser (optional - press Ctrl+C to skip)"
python manage.py createsuperuser --noinput --skip-checks 2>/dev/null || true

# Seed data
echo ""
echo "🌱 Seeding database..."
python manage.py seed_data

echo ""
echo "✅ Setup complete! Run: python manage.py runserver"
