from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings
import os
import json

class Settings(BaseSettings):
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

# Test case 1: JSON string (what I told the user to use)
try:
    os.environ["BACKEND_CORS_ORIGINS"] = '["http://localhost:3000", "https://foo.com"]'
    settings = Settings()
    print(f"JSON String: {[str(url) for url in settings.BACKEND_CORS_ORIGINS]}")
    print(f"Type: {type(settings.BACKEND_CORS_ORIGINS)}")
    if str(settings.BACKEND_CORS_ORIGINS[0]).endswith("/"):
        print("FAIL: Trailing slash detected!")
    else:
        print("SUCCESS: No trailing slash.")
except Exception as e:
    print(f"JSON String Failed: {e}")

# Test case 2: Comma separated string
try:
    os.environ["BACKEND_CORS_ORIGINS"] = "http://localhost:3000,https://foo.com"
    settings = Settings()
    print(f"Comma String: {settings.BACKEND_CORS_ORIGINS}")
except Exception as e:
    print(f"Comma String Failed: {e}")
