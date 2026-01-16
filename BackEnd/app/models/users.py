from ..database import Base
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, TIMESTAMP, Enum, UniqueConstraint
)
import enum
from sqlalchemy.sql import func


class UserType(str, enum.Enum):
    admin = "admin"
    player = "player"
    affiliate = "affiliate"

class DocType(str, enum.Enum):
    aadhar = "aadhar"
    pan = "pan"
    
class Users(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(Text, nullable=False)
    last_name = Column(Text)
    is_active = Column(Boolean, default=False)
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"))
    email = Column(Text, unique=True, nullable=False)
    phone = Column(Text)
    password = Column(Text, nullable=False)
    role = Column(Enum(UserType), default=UserType.player)
    created_by = Column(Integer, ForeignKey("users.user_id"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

class UserKYC(Base):
    __tablename__ = "user_kyc"
    __table_args__ = (
        UniqueConstraint("user_id", "document_type"),
    )

    kyc_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    document_type = Column(Enum(DocType), nullable=False)
    document_number = Column(String(16), nullable=False)
    verified_status = Column(Boolean, default=False)
    verified_at = Column(TIMESTAMP(timezone=True))
