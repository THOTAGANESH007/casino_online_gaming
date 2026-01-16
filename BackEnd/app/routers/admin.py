from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.auth import get_current_user
from ..dependencies.db import get_db
from ..models.users import UserKYC, Users
from ..models.tenants import Tenant
from ..models.games import GameProvider

router = APIRouter(prefix="/admin", tags = ["Admin"])

@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(Users).all()

@router.get("/tenants")
def get_all_tenants(db: Session = Depends(get_db)):
    return db.query(Tenant).all()

@router.get("/game-providers")
def get_game_providers(db: Session = Depends(get_db)):
    return db.query(GameProvider).all()

@router.get("/affiliates")
def get_affiliates(db: Session = Depends(get_db)):
    return db.query(Users).filter(Users.role == "affiliate").all()


def admin_only(user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(403, "Admin access required")
    return user


from fastapi import BackgroundTasks
from app.utils.email_sender import send_email

@router.post("/approve-kyc")
def approve_kyc(
    kyc_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    kyc = db.query(UserKYC).filter(UserKYC.kyc_id == kyc_id).first()
    if not kyc:
        raise HTTPException(404, "KYC not found")

    kyc.verified_status = True
    kyc.verified_at = func.now()

    user = db.query(Users).filter(Users.user_id == kyc.user_id).first()
    user.is_active = True

    db.commit()

    background_tasks.add_task(
        send_email,
        to_email=user.email,
        subject="KYC Approved",
        template_name="kyc_approved_email.html",
        context={
            "first_name": user.first_name,
            "platform_name": "Casino Platform"
        }
    )

    return {"message": "KYC approved and user activated"}



@router.post("/reject-kyc")
def reject_kyc(
    kyc_id: int,
    reason: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    kyc = db.query(UserKYC).filter(UserKYC.kyc_id == kyc_id).first()
    if not kyc:
        raise HTTPException(404)

    user = db.query(Users).filter(Users.user_id == kyc.user_id).first()
    db.delete(kyc)
    db.commit()

    background_tasks.add_task(
        send_email,
        to_email=user.email,
        subject="KYC Rejected",
        template_name="kyc_rejected_email.html",
        context={
            "first_name": user.first_name,
            "platform_name": "Casino Platform"
        }
    )

    return {"message": "KYC rejected and email sent"}
