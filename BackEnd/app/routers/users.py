from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from sqlalchemy.orm import Session

from ..models.tenants import TenantRegion

from ..core.security import create_access_token, hash_password, verify_password
from ..dependencies.db import get_db
from ..models.users import Users
from ..models.users import UserKYC
from ..schemas.users import SignupResponse, UserCreate, UserResponse, KycCreate
import pytesseract
import cv2
import re
from pathlib import Path
import numpy as np
from pdf2image import convert_from_path
from ..utils.email_sender import send_email
from ..repositories.users import location_select, send_email_registration, sign_up_user, verify_kyc

router = APIRouter(prefix="/user", tags=["Users"])

db_dependency = Annotated[Session,Depends(get_db)]


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user
    

# Text Extraction Start

def is_valid_name(name: str) -> bool:
    words = name.split()

    # Aadhaar English names are usually 2 words
    if len(words) != 2:
        return False

    for w in words:
        if not w.isalpha():        # only A–Z
            return False
        if len(w) < 3:            # avoid Bey, Seq, etc.
            return False
        if not w[0].isupper():    # must start with capital
            return False

    return True


def normalize_text(text: str) -> str:
    return text.encode("ascii", errors="ignore").decode()


def extract_from_ocr(text: str):
    aadhaar = re.search(r"\b\d{4}\s\d{4}\s\d{4}\b", text)
    dob = re.search(r"\bDOB[:\s]*\d{2}/\d{2}/\d{4}\b", text, re.I)
    dob = dob.group().split()[-1] if dob else None
    gender = "Male" if re.search(r"\bMALE\b", text, re.I) else \
             "Female" if re.search(r"\bFEMALE\b", text, re.I) else None

    text = normalize_text(text)
    lines = [l.strip() for l in text.split("\n") if l.strip()]


    candidates = []

    for line in lines:
        if is_valid_name(line):
            candidates.append(line)
            
    valid_name = None

    for c in candidates:
        if is_valid_name(c):
            valid_name = c
            break

    return {
        "name": valid_name,
        "dob": dob,
        "gender": gender,
        "aadhaar_last4": aadhaar.group()[-4:] if aadhaar else None,
        "aadhaar_masked": f"XXXX-XXXX-{aadhaar.group()[-4:]}" if aadhaar else None
    }

@router.get("/")
def extract_aadhar():
    pdf_path = Path(__file__).resolve().parents[2] / "uploads" / "aadhaar.pdf"

    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF not found")

    text = ""
    images = convert_from_path(pdf_path, dpi=300)

    for img in images:
        img = cv2.cvtColor(np.array(img), cv2.COLOR_BGR2GRAY)
        img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        text += pytesseract.image_to_string(img)

    return extract_from_ocr(text)

# Text Extraction End

# Signup Module Start

@router.post("/signup", response_model=SignupResponse)
def signup_user(data: UserCreate,db: db_dependency):
    user = sign_up_user(db=db, user_data=data)

    return {
        "user_id": user.user_id,
        "next_step": "SELECT_LOCATION"
    }

@router.get("/locations")
def fetch_locations(db: db_dependency):
    return db.query(TenantRegion).all()

@router.post("/select-location")
def select_location(user_id: int,tenant_id: int,db: db_dependency):
    location = location_select(user_id=user_id, tenant_id=tenant_id, db=db)

    return {
        "message": f"Selected Location with Tenant ID: {location.tenant_id}",
        "next_step": "KYC_VERIFICATION"
    }

@router.post("/kyc-verification")
def kyc_verification(user_id: int,data: KycCreate,db: db_dependency):
    kyc = verify_kyc(user_id=user_id, data=data, db=db)
    return {
        "message": "KYC submitted successfully. Verification in progress.",
        "next_step": "EMAIL_VERIFICATION"
    }



@router.post("/send-registration-email")
def send_registration_email(user_id: int,db: db_dependency):
    email_sent = send_email_registration(user_id=user_id, db=db)

    if not email_sent:
        raise HTTPException(
            status_code=500,
            detail="Failed to send verification email"
        )

    return {
        "message": "Verification email sent successfully",
        "email_sent": True
    }


# Signup Module End


# Update Module Start

@router.post("/update-user")
def update_user(
    user_id: int,
    db: db_dependency,
    first_name: str | None = None,
    last_name: str | None = None,
    phone: str | None = None,
):
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name
    if phone:
        user.phone = phone

    db.commit()
    return {"message": "User updated successfully"}


@router.post("/update-location")
def update_location(
    user_id: int,
    tenant_id: int,
    db: db_dependency
):
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    user.tenant_id = tenant_id
    db.commit()

    return {"message": "Location updated successfully"}


# Update Module End


@router.get("/support")
def contact_support():
    return {
        "email": "support@casino-platform.com",
        "message": "Our team will respond within 24 hours"
    }


@router.post("/login")
def login(
    email: str,
    password: str,
    db: db_dependency
):
    user = db.query(Users).filter(Users.email == email).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(401, "Invalid credentials")

    if not user.is_active:
        raise HTTPException(403, "Account not activated. KYC pending.")

    token = create_access_token({"user_id": user.user_id})
    return {"access_token": token, "token_type": "bearer"}
