from pydantic_settings import BaseSettings
from pydantic import ConfigDict
class Settings(BaseSettings):
     # Database
    DATABASE_URL: str

    JWT_SECRET_KEY: str

    # Email (SMTP)
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USERNAME: str
    EMAIL_PASSWORD: str
    EMAIL_FROM: str | None = None
    
    model_config = ConfigDict(env_file=".env",env_file_encoding="utf-8")

settings = Settings()