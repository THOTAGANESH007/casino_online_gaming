from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies.db import get_db
from ..models.games import Game

router = APIRouter(prefix="/games", tags=["Games"])

@router.get("/{game_name}")
def fetch_game(game_name: str, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.game_name.ilike(game_name)).first()
    if not game:
        raise HTTPException(404, "Game not found")
    return game
