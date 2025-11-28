from app.main import app
from fastapi.middleware.cors import CORSMiddleware

print("Inspecting Middleware...")
for middleware in app.user_middleware:
    if middleware.cls == CORSMiddleware:
        print(f"Found CORSMiddleware")
        print(f"Options: {middleware.options}")
        # Accessing the actual configured origins is tricky as it's in the closure or options
        # But we can check the options dict passed to it
        print(f"Allow Origins: {middleware.options.get('allow_origins')}")
