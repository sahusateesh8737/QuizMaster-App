#!/bin/bash

# Production Database Migration Script for Vercel Deployment
# This script runs migrations against your production database

set -e

echo "🚀 QuizMaster Production Migration Script"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    echo ""
    echo "Please set it first:"
    echo "  export DATABASE_URL='postgresql://user:pass@host:5432/db?sslmode=require'"
    echo ""
    echo "Get your DATABASE_URL from:"
    echo "  - Neon: https://console.neon.tech"
    echo "  - Supabase: https://app.supabase.com → Settings → Database"
    echo "  - Vercel: Dashboard → Storage → Your Database"
    exit 1
fi

echo "✓ DATABASE_URL is set"
echo ""

# Set Django settings
export DJANGO_SETTINGS_MODULE=config.settings.vercel

echo "📦 Installing dependencies..."
pip install -q psycopg2-binary dj-database-url

echo "✓ Dependencies installed"
echo ""

echo "🔄 Running migrations..."
python manage.py migrate --noinput

echo "✓ Migrations complete"
echo ""

echo "👤 Creating superuser (if needed)..."
echo "Skip this if superuser already exists"
read -p "Create superuser? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

echo ""
echo "📚 Initializing quiz categories..."
python manage.py shell <<EOF
from apps.quizzes.models import Category

categories = [
    {'name': 'Programming', 'slug': 'programming', 'description': 'Programming and software development'},
    {'name': 'Science', 'slug': 'science', 'description': 'Science and technology'},
    {'name': 'Mathematics', 'slug': 'mathematics', 'description': 'Mathematics and logic'},
    {'name': 'History', 'slug': 'history', 'description': 'Historical events and facts'},
    {'name': 'General Knowledge', 'slug': 'general-knowledge', 'description': 'General knowledge and trivia'},
]

for cat_data in categories:
    category, created = Category.objects.get_or_create(
        slug=cat_data['slug'],
        defaults=cat_data
    )
    if created:
        print(f"✓ Created category: {cat_data['name']}")
    else:
        print(f"• Category exists: {cat_data['name']}")

print(f"\nTotal categories: {Category.objects.count()}")
EOF

echo ""
echo "✅ Production database setup complete!"
echo ""
echo "🧪 Test your API:"
echo "  curl https://quiz-master-app-h5z5.vercel.app/api/quizzes/categories/"
echo ""
echo "📝 Next steps:"
echo "  1. Commit and push your code changes"
echo "  2. Vercel will auto-redeploy"
echo "  3. Test endpoints with Postman collection"
echo ""
