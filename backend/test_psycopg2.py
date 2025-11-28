import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def test_connection():
    print(f"Testing psycopg2 connection to {DATABASE_URL}")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("✅ Successfully connected with psycopg2!")
        conn.close()
    except Exception as e:
        print(f"❌ Failed with psycopg2: {e}")

if __name__ == "__main__":
    test_connection()
