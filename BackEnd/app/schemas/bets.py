from pydantic import BaseModel,ConfigDict
from typing import Optional
from decimal import Decimal
from ..models.bets import (BetType, BetStatus)


class BetCreate(BaseModel):
    bet_amount: Decimal
    odds: Decimal
    bet_type: BetType = BetType.single


class BetResponse(BaseModel):
    bet_id: int
    bet_amount: Decimal
    payout_amount: Optional[Decimal]
    bet_status: BetStatus

    model_config = ConfigDict(from_attributes = True)
