from ..database import Base
from sqlalchemy import (
    Column, Integer, Numeric, Text, ForeignKey)


class GameProvider(Base):
    __tablename__ = "game_provider"

    provider_id = Column(Integer, primary_key=True)
    provider_name = Column(Text, unique=True, nullable=False)


class GameCategory(Base):
    __tablename__ = "game_category"

    category_id = Column(Integer, primary_key=True)
    category_name = Column(Text, unique=True, nullable=False)


class Game(Base):
    __tablename__ = "game"

    game_id = Column(Integer, primary_key=True)
    provider_id = Column(Integer, ForeignKey("game_provider.provider_id"))
    category_id = Column(Integer, ForeignKey("game_category.category_id"))
    game_name = Column(Text, nullable=False)
    rtp_percent = Column(Numeric(5, 2))
