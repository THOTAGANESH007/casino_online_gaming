from ..database import Base
from sqlalchemy import (
    Column, Integer, ForeignKey, TIMESTAMP,Numeric)

from sqlalchemy.sql import func
class Jackpot(Base):
    __tablename__ = "jackpot"

    jackpot_id = Column(Integer, primary_key=True)
    game_id = Column(Integer, ForeignKey("game.game_id"))
    current_amount = Column(Numeric(18, 2))


class JackpotWin(Base):
    __tablename__ = "jackpot_win"

    win_id = Column(Integer, primary_key=True)
    jackpot_id = Column(Integer, ForeignKey("jackpot.jackpot_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    win_amount = Column(Numeric(18, 2))
    won_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
