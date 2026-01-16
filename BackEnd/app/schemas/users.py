from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
from ..models.users import UserType, DocType


class UserCreate(BaseModel):
    first_name: str
    last_name: Optional[str]
    email: EmailStr
    phone: Optional[str]
    password: str
    tenant_id: Optional[int] = None
    role: UserType = UserType.player


class UserResponse(BaseModel):
    user_id: int
    first_name: str
    last_name: Optional[str]
    email: EmailStr
    role: UserType
    is_active: bool
    tenant_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes = True)

class SignupResponse(BaseModel):
    user_id: int
    next_step: str

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