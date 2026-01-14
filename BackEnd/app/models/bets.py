from ..database import Base
from sqlalchemy import (
    Column, Integer, Numeric, ForeignKey, TIMESTAMP, Enum)
import enum
from sqlalchemy.sql import func


class BetType(str, enum.Enum):
    single = "Single Bet"
    multiple = "Multiple Bet"
    full_cover = "Full Cover Bet"

class BetStatus(str, enum.Enum):
    placed = "placed"
    won = "won"
    lost = "lost"
    cancelled = "cancelled"
    
    
class Bet(Base):
    __tablename__ = "bet"

    bet_id = Column(Integer, primary_key=True)
    round_id = Column(Integer, ForeignKey("game_round.round_id"))
    wallet_id = Column(Integer, ForeignKey("wallet.wallet_id"))
    bet_amount = Column(Numeric(18, 2), nullable=False)
    payout_amount = Column(Numeric(18, 2))
    odds = Column(Numeric(8, 4))
    bet_type = Column(Enum(BetType), default=BetType.single)
    bet_status = Column(Enum(BetStatus), default=BetStatus.placed)
    placed_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
