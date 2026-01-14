from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
from models import (UserType, DocType)


class UserCreate(BaseModel):
    first_name: str
    last_name: Optional[str]
    email: EmailStr
    phone: Optional[str]
    password: str
    role: UserType = UserType.player


class UserResponse(BaseModel):
    user_id: int
    first_name: str
    last_name: Optional[str]
    email: EmailStr
    role: UserType
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes = True)

class KycCreate(BaseModel):
    document_type: DocType
    document_number: str


class KycResponse(BaseModel):
    kyc_id: int
    document_type: DocType
    verified_status: bool
    verified_at: Optional[datetime]

    model_config = ConfigDict(from_attributes = True)


class Login(BaseModel):
    email:str
    password:str
    role:str

class Token(BaseModel):
    access_token:str
    token_type:str

class TokenData(BaseModel):
    email:Optional[str] = None