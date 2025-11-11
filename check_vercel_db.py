#!/usr/bin/env python3
"""
Quick script to test what's wrong with Vercel deployment
"""
import requests
import json

BACKEND_URL = "https://quiz-master-app-swart.vercel.app"

print("🔍 Testing Vercel Backend...\n")

# Test 1: Check if backend is alive
print("1️⃣ Testing backend root endpoint...")
try:
    response = requests.get(f"{BACKEND_URL}/api/")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Backend is responding")
    else:
        print(f"   ❌ Backend returned: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print()

# Test 2: Check categories (should work without auth)
print("2️⃣ Testing categories endpoint...")
try:
    response = requests.get(f"{BACKEND_URL}/api/categories/")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Categories endpoint works")
        data = response.json()
        print(f"   Found {len(data)} categories")
    else:
        print(f"   ❌ Categories returned: {response.status_code}")
        print(f"   Response: {response.text[:500]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print()

# Test 3: Try registration
print("3️⃣ Testing registration endpoint...")
test_data = {
    "username": "testuser123",
    "email": "test123@example.com",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "role": "student"
}
try:
    response = requests.post(
        f"{BACKEND_URL}/api/users/register/",
        json=test_data,
        headers={"Content-Type": "application/json"}
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        print("   ✅ Registration works!")
    else:
        print(f"   ❌ Registration failed with: {response.status_code}")
        print(f"   Response: {response.text[:500]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print()

# Test 4: Check admin (should redirect or show login)
print("4️⃣ Testing admin endpoint...")
try:
    response = requests.get(f"{BACKEND_URL}/admin/", allow_redirects=False)
    print(f"   Status: {response.status_code}")
    if response.status_code in [200, 301, 302]:
        print("   ✅ Admin endpoint is working")
    else:
        print(f"   ❌ Admin returned: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "="*60)
print("📋 DIAGNOSIS:")
print("="*60)
print("""
If you see 500 errors above, the most likely causes are:

1. ❌ No DATABASE_URL environment variable in Vercel
   → Database tables don't exist
   → Django can't create users

2. ❌ Migrations not run on production database
   → Even if DATABASE_URL is set, tables aren't created

3. ❌ SECRET_KEY not set in Vercel environment
   → Django won't start properly

IMMEDIATE FIX:
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your backend project: quiz-master-app-swart
3. Go to Settings → Environment Variables
4. Add these variables (if not already there):
   - DATABASE_URL (from Vercel Postgres or Supabase)
   - SECRET_KEY (generate at https://djecrety.ir/)
5. Redeploy the project
6. Run migrations (see BACKEND_500_FIX.md)
""")
