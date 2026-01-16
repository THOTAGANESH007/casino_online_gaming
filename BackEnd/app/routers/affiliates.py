from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from ..dependencies.db import get_db
from ..models.users import Users

router = APIRouter(prefix="/referral", tags=["Affiliates"])

@router.get("/players")
def get_referred_players(
    affiliate_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Users).filter(
        Users.created_by == affiliate_id,
        Users.role == "player"
    ).all()

@router.get("/commission")
def calculate_commission():
    return {
        "message": "Commission calculation will be added when referral tables exist"
    }