from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..utils.email_sender import send_email

from ..core.security import hash_password
from ..models.users import UserKYC, Users
from ..schemas.users import KycCreate, UserCreate

def sign_up_user(db: Session, user_data: UserCreate) -> Users:
    """Sign up a new user."""
    # Check if user already exists
    existing_user = db.query(Users).filter(Users.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user_data.password)
    new_user = Users(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        phone=user_data.phone,
        password=hashed_password,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def location_select(user_id: int, tenant_id: int, db: Session):
    """Select location for the user."""
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.tenant_id = tenant_id
    db.commit()
    db.refresh(user)
    return user
    
def verify_kyc(user_id:int, data:KycCreate, db:Session):
    """Verify KYC for the user."""
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    existing_kyc = db.query(UserKYC).filter(
        UserKYC.user_id == user_id,
        UserKYC.document_type == data.document_type
    ).first()

    if existing_kyc:
        raise HTTPException(400, "KYC already submitted for this document")

    kyc = UserKYC(
        user_id=user_id,
        document_type=data.document_type,
        document_number=data.document_number,
        verified_status=False
    )

    db.add(kyc)
    db.commit()
    db.refresh(kyc)
    return kyc

def send_email_registration(user_id: int, db: Session) -> bool:
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    email_sent = send_email(
        to_email=user.email,
        subject="KYC Verification In Progress",
        template_name="kyc_pending_email.html",
        context={
            "first_name": user.first_name,
            "platform_name": "Casino Platform"
        }
    )

    return email_sent
