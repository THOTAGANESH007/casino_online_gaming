from fastapi import APIRouter

router = APIRouter(prefix="/bets", tags=["Bets"])

@router.get("/place-bet")
def place_bet():
    pass
