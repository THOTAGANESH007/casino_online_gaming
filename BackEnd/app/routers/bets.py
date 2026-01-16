from fastapi import APIRouter, Depends, HTTPException


from sqlalchemy.orm import Session
from ..dependencies.db import get_db
from ..schemas.bets import BetCreate, BetResponse
from ..models.wallets import Wallet
from ..models.bets import Bet

router = APIRouter(prefix="/bets", tags=["Bets"])

@router.post("/place", response_model=BetResponse)
def place_bet(
    round_id: int,
    wallet_id: int,
    data: BetCreate,
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.wallet_id == wallet_id).first()
    if not wallet or wallet.balance < data.bet_amount:
        raise HTTPException(400, "Insufficient balance")

    wallet.balance -= data.bet_amount

    bet = Bet(
        round_id=round_id,
        wallet_id=wallet_id,
        bet_amount=data.bet_amount,
        odds=data.odds,
        bet_type=data.bet_type
    )

    db.add(bet)
    db.commit()
    db.refresh(bet)

    return bet
