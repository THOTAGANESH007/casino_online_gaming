from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from sqlalchemy.orm import Session
from ..dependencies.db import get_db
from ..models.user import Users
import pytesseract
import cv2
import re
from pathlib import Path
import numpy as np
from pdf2image import convert_from_path


router = APIRouter(prefix="/user", tags=["Users"])

db_dependency = Annotated[Session,Depends(get_db)]


@router.get("/{id}")
def get_user(id:int, db:db_dependency):
    user  = db.query(Users).filter(Users.id == id).first()
    return user
    
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