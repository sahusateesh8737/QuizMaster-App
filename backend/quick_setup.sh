#!/bin/bash

# Quick Setup Script - Get Your API Working in 5 Minutes
# This script guides you through fixing the database issue

cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 QuizMaster API - Quick Database Setup               ║
║                                                           ║
║   This will fix the "no such table" errors               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

EOF

echo ""
echo "📋 What we'll do:"
echo "   1. Help you get a FREE PostgreSQL database (Neon)"
echo "   2. Add DATABASE_URL to Vercel"
echo "   3. Run migrations"
echo "   4. Test your API"
echo ""
read -p "Ready to start? (Press Enter)"
echo ""

echo "Step 1: Get Free Database from Neon"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Opening Neon.tech in your browser..."
sleep 2

# Open Neon in browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "https://console.neon.tech/signup" 2>/dev/null || echo "Please visit: https://console.neon.tech/signup"
else
    xdg-open "https://console.neon.tech/signup" 2>/dev/null || echo "Please visit: https://console.neon.tech/signup"
fi

echo ""
echo "📝 Instructions:"
echo "   1. Sign up with GitHub (easiest)"
echo "   2. Create a new project called 'quizmaster'"
echo "   3. Copy the connection string (looks like):"
echo "      postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb"
echo ""
echo "   ⚠️  Make sure the connection string ends with: ?sslmode=require"
echo ""
read -p "Press Enter when you have copied your DATABASE_URL..."
echo ""

echo "Step 2: Add to Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Opening Vercel settings..."
sleep 1

if [[ "$OSTYPE" == "darwin"* ]]; then
    open "https://vercel.com/dashboard" 2>/dev/null || echo "Please visit: https://vercel.com/dashboard"
else
    xdg-open "https://vercel.com/dashboard" 2>/dev/null || echo "Please visit: https://vercel.com/dashboard"
fi

echo ""
echo "📝 Instructions:"
echo "   1. Go to your project"
echo "   2. Settings → Environment Variables"
echo "   3. Click 'Add New'"
echo "   4. Key: DATABASE_URL"
echo "   5. Value: (paste your Neon connection string)"
echo "   6. Select: Production, Preview, and Development"
echo "   7. Click 'Save'"
echo ""
read -p "Press Enter when DATABASE_URL is added to Vercel..."
echo ""

echo "Step 3: Run Migrations Locally"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Now paste your DATABASE_URL here (it will be used locally):"
read -p "DATABASE_URL: " db_url

if [ -z "$db_url" ]; then
    echo "❌ No DATABASE_URL provided. Exiting."
    exit 1
fi

export DATABASE_URL="$db_url"
echo "✓ DATABASE_URL set"
echo ""

cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
pip install -q psycopg2-binary dj-database-url Django djangorestframework

echo "🔄 Running migrations..."
python manage.py migrate --settings=config.settings.vercel

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Migration failed. Please check:"
    echo "   1. DATABASE_URL is correct"
    echo "   2. Database is accessible"
    echo "   3. You're in the backend directory"
    exit 1
fi

echo "✓ Migrations complete!"
echo ""

echo "📚 Initializing categories..."
python manage.py shell --settings=config.settings.vercel <<PYEOF
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
    status = "✓ Created" if created else "• Exists"
    print(f"{status}: {cat_data['name']}")

print(f"\nTotal categories: {Category.objects.count()}")
PYEOF

echo ""
echo "Step 4: Redeploy & Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔄 Your API needs to redeploy to pick up the new DATABASE_URL"
echo ""
echo "Options:"
echo "   A) Push a git commit (triggers auto-deploy)"
echo "   B) Go to Vercel Dashboard → Deployments → Redeploy"
echo ""
read -p "Choose option (A/B): " deploy_choice

if [[ $deploy_choice =~ ^[Aa]$ ]]; then
    cd ..
    git add backend/requirements.txt backend/config/settings/vercel.py
    git commit -m "fix: enable PostgreSQL and disable debug mode"
    git push
    echo "✓ Pushed to GitHub - Vercel will auto-deploy"
else
    echo "📱 Opening Vercel dashboard for manual redeploy..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "https://vercel.com/dashboard" 2>/dev/null
    else
        xdg-open "https://vercel.com/dashboard" 2>/dev/null
    fi
fi

echo ""
echo "⏳ Wait ~2 minutes for deployment..."
sleep 3

echo ""
echo "Step 5: Test Your API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 Testing endpoints..."
echo ""

BASE_URL="https://quiz-master-app-h5z5.vercel.app"

echo "1️⃣  Testing root endpoint..."
curl -s "$BASE_URL/" | grep -q "QuizMaster API" && echo "   ✅ Root endpoint works!" || echo "   ❌ Root endpoint failed"

sleep 2

echo ""
echo "2️⃣  Testing categories endpoint..."
CATEGORIES=$(curl -s "$BASE_URL/api/quizzes/categories/")
if echo "$CATEGORIES" | grep -q "Programming\|Science"; then
    echo "   ✅ Categories endpoint works!"
    echo "   Found: $(echo $CATEGORIES | grep -o '"name"' | wc -l | xargs) categories"
else
    echo "   ❌ Categories endpoint failed - may need more time for deployment"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ✅ Setup Complete!                                     ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next Steps:"
echo ""
echo "   1. Test with Postman:"
echo "      - Import: QuizMaster_API_Collection.postman_collection.json"
echo "      - Set base_url: $BASE_URL"
echo "      - Run collection"
echo ""
echo "   2. Create superuser (admin access):"
echo "      export DATABASE_URL='$db_url'"
echo "      python manage.py createsuperuser --settings=config.settings.vercel"
echo ""
echo "   3. Access admin panel:"
echo "      $BASE_URL/admin/"
echo ""
echo "📊 Test these endpoints:"
echo "   • $BASE_URL/api/quizzes/categories/"
echo "   • $BASE_URL/api/users/register/"
echo "   • $BASE_URL/api/schema/swagger-ui/"
echo ""
echo "📚 Documentation:"
echo "   • API Testing: API_TESTING_REPORT.md"
echo "   • Detailed Guide: VERCEL_FIX_GUIDE.md"
echo ""
echo "🎉 Your API should now be fully functional!"
echo ""
