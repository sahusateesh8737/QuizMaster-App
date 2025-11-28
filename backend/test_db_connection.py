import asyncio
import asyncpg
import os
import ssl
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def test_connection():
    print(f"Testing connection to {DATABASE_URL}")

    # Test 1: No SSL
    print("\n--- Test 1: No SSL ---")
    try:
        conn = await asyncpg.connect(DATABASE_URL, ssl=False)
        print("✅ Successfully connected without SSL!")
        await conn.close()
        return
    except Exception as e:
        print(f"❌ Failed without SSL: {e}")

    # Test 2: SSL (Default)
    print("\n--- Test 2: SSL='require' ---")
    try:
        conn = await asyncpg.connect(DATABASE_URL, ssl="require")
        print("✅ Successfully connected with SSL='require'!")
        await conn.close()
        return
    except Exception as e:
        print(f"❌ Failed with SSL='require': {e}")

    # Test 3: SSL (No Verification)
    print("\n--- Test 3: SSL (No Verification) ---")
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        conn = await asyncpg.connect(DATABASE_URL, ssl=ctx)
        print("✅ Successfully connected with SSL (No Verification)!")
        await conn.close()
        return
    except Exception as e:
        print(f"❌ Failed with SSL (No Verification): {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
