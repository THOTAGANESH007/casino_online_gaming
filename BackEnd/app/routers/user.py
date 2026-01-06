from fastapi import APIRouter, Depends
from typing import Annotated
from sqlalchemy.orm import Session
from ..dependencies.db import get_db
from ..models.user import Users

router = APIRouter(prefix="/user", tags=["Users"])

db_dependency = Annotated[Session,Depends(get_db)]
@router.get("/{id}")
def get_user(id:int, db:db_dependency):
    user  = db.query(Users).filter(Users.id == id).first()
    return user
    