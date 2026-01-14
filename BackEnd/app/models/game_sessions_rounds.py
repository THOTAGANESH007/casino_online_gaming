from ..database import Base
from sqlalchemy import (
    Column, Integer, String, ForeignKey, TIMESTAMP)
from sqlalchemy.sql import func

class GameSession(Base):
    __tablename__ = "game_session"

    session_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    game_id = Column(Integer, ForeignKey("game.game_id"))
    provider_session_ref = Column(String(64))
    started_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    ended_at = Column(TIMESTAMP(timezone=True))


class GameRound(Base):
    __tablename__ = "game_round"

    round_id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("game_session.session_id"))
    round_number = Column(Integer)
    provider_round_ref = Column(String(64))
