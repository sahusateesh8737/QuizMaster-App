#!/bin/bash

# One-Command Fix for 500 Internal Server Error
# This script fixes the database issue causing the 500 error

set -e

cat << 'EOF'
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   FIX 500 ERROR - QuizMaster API                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

The 500 error is caused by missing database tables.
Let's fix it in 3 steps!

EOF

echo "Step 1: Get Your DATABASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If you haven't already:"
echo "1. Visit: https://console.neon.tech/signup"
echo "2. Sign up with GitHub (free, instant)"
echo "3. Create project 'quizmaster'"
echo "4. Copy the connection string"
echo ""
read -p "Paste your DATABASE_URL here: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ No DATABASE_URL provided. Exiting."
    exit 1
fi

# Validate it's a PostgreSQL URL
if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
    echo "❌ Invalid DATABASE_URL. Must start with postgresql://"
    exit 1
fi

export DATABASE_URL

echo "✅ DATABASE_URL set"
echo ""

echo "Step 2: Add to Vercel (CRITICAL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: You MUST add this to Vercel!"
echo ""
echo "1. Opening Vercel dashboard..."
open "https://vercel.com/dashboard" 2>/dev/null || echo "Visit: https://vercel.com/dashboard"
echo ""
echo "2. Go to: Your Project → Settings → Environment Variables"
echo "3. Click 'Add New'"
echo "4. Set:"
echo "   Name: DATABASE_URL"
echo "   Value: $DATABASE_URL"
echo "   Environment: Production, Preview, Development (all three)"
echo "5. Click 'Save'"
echo ""
read -p "Press Enter after you've added DATABASE_URL to Vercel..."
echo ""

echo "Step 3: Run Migrations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$(dirname "$0")/backend"

echo "📦 Installing dependencies..."
pip install -q psycopg2-binary dj-database-url Django djangorestframework 2>/dev/null || pip3 install -q psycopg2-binary dj-database-url Django djangorestframework

echo "🔄 Running migrations..."
python manage.py migrate --settings=config.settings.vercel --noinput

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Migration failed!"
    echo "Please check:"
    echo "  • DATABASE_URL is correct"
    echo "  • Database is accessible"
    echo "  • You have internet connection"
    exit 1
fi

echo "✅ Migrations complete!"
echo ""

echo "📚 Creating default categories..."
python manage.py shell --settings=config.settings.vercel <<PYEOF
from apps.quizzes.models import Category

categories = [
    {'name': 'Programming', 'slug': 'programming', 'description': 'Programming and software development'},
    {'name': 'Science', 'slug': 'science', 'description': 'Science and technology'},
    {'name': 'Mathematics', 'slug': 'mathematics', 'description': 'Mathematics and logic'},
]

for cat_data in categories:
    cat, created = Category.objects.get_or_create(
        slug=cat_data['slug'],
        defaults=cat_data
    )
    print(f"{'✓ Created' if created else '• Exists'}: {cat_data['name']}")

print(f"\nTotal: {Category.objects.count()} categories")
PYEOF

echo ""
echo "Step 4: Redeploy to Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your code changes need to be deployed to pick up the DATABASE_URL."
echo ""
echo "Choose how to redeploy:"
echo "  A) Git push (auto-deploys)"
echo "  B) Manual redeploy in Vercel dashboard"
echo ""
read -p "Choose (A/B): " choice

if [[ $choice =~ ^[Aa]$ ]]; then
    cd ..
    echo ""
    echo "Committing changes..."
    git add backend/requirements.txt backend/config/settings/vercel.py 2>/dev/null
    git commit -m "fix: enable PostgreSQL and disable debug mode for production" 2>/dev/null || echo "No changes to commit (already committed)"
    
    echo "Pushing to GitHub..."
    git push
    
    echo "✅ Pushed! Vercel is deploying..."
else
    echo ""
    echo "Opening Vercel dashboard for manual redeploy..."
    open "https://vercel.com/dashboard" 2>/dev/null
    echo ""
    echo "In Vercel:"
    echo "1. Go to your project"
    echo "2. Deployments tab"
    echo "3. Click '...' on latest deployment"
    echo "4. Click 'Redeploy'"
fi

echo ""
echo "⏳ Waiting for deployment (~2 minutes)..."
echo ""
read -p "Press Enter when deployment is complete..."

echo ""
echo "Step 5: Test Your API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BASE_URL="https://quiz-master-app-h5z5.vercel.app"

echo "Testing registration endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/users/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test123@example.com",
    "username": "testuser123",
    "password": "Test@123456",
    "password2": "Test@123456",
    "first_name": "Test",
    "last_name": "User",
    "role": "student"
  }')

STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$STATUS_CODE" = "201" ] || [ "$STATUS_CODE" = "400" ]; then
    echo "✅ Registration endpoint works! (Status: $STATUS_CODE)"
    if [ "$STATUS_CODE" = "400" ]; then
        echo "   (400 is OK - user might already exist)"
    fi
else
    echo "❌ Still failing with status: $STATUS_CODE"
    echo ""
    echo "Response:"
    echo "$BODY"
    echo ""
    echo "Troubleshooting:"
    echo "  • Verify DATABASE_URL is in Vercel env vars"
    echo "  • Check deployment completed successfully"
    echo "  • View logs: https://vercel.com/dashboard → Your Project → Deployments"
fi

echo ""
echo "Testing categories endpoint..."
curl -s "$BASE_URL/api/quizzes/categories/" | head -c 200

echo ""
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ✅ Setup Complete!                                     ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 Your API should now be working!"
echo ""
echo "Test in browser:"
echo "  $BASE_URL/api/quizzes/categories/"
echo ""
echo "Test with Postman:"
echo "  1. Import: QuizMaster_API_Collection.postman_collection.json"
echo "  2. Set base_url: $BASE_URL"
echo "  3. Run collection"
echo ""
