from typing import List, Union
from pydantic import AnyHttpUrl, PostgresDsn, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "QuizMaster API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "django-insecure-dev-key-change-in-production"  # Fallback for dev
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://quiz-master-app-flame.vercel.app",
        "https://quiz-master-app-roh5.vercel.app",
        "https://quiz-master-app-h5z5.vercel.app",
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        print(f"DEBUG: assemble_cors_origins input: {v} (type: {type(v)})")
        
        if isinstance(v, str):
            if not v.startswith("["):
                return [i.strip() for i in v.split(",")]
            else:
                # Try parsing JSON string
                import json
                try:
                    parsed = json.loads(v)
                    print(f"DEBUG: Parsed JSON: {parsed}")
                    return parsed
                except json.JSONDecodeError:
                    # Fallback if it looks like a list but isn't valid JSON (e.g. single quotes)
                    # This is risky but might handle '["url"]'
                    return v
                    
        if isinstance(v, list):
            # Handle nested list case (suspected Railway issue)
            if len(v) > 0 and isinstance(v[0], list):
                print("DEBUG: Flattening nested list")
                return [item for sublist in v for item in sublist]
            return v
            
        return v

    # Database
    DATABASE_URL: str

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
