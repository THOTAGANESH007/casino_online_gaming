from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from .config import settings
import hashlib

ALGORITHM = "HS256"


pass_context = CryptContext(schemes=["argon2"],deprecated="auto") # bcrypt allows only 72 bytes long (argon2_cffi)

def hash_password(password:str):
    sha256_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return pass_context.hash(sha256_hash)

def verify_password(plain_password:str, hashed_password: str):
    sha256_hash = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    return pass_context.verify(sha256_hash,hashed_password)

def create_access_token(data: dict, expires_minutes: int = 60):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)
