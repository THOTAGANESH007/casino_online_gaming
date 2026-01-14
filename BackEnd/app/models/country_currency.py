from sqlalchemy import (
    Column, Integer, String, Text,Numeric)
from ..database import Base


class CountryCurrencyCode(Base):
    __tablename__ = "country_currency_codes"

    cc_id = Column(Integer, primary_key=True)
    currency_code = Column(String(3), unique=True, nullable=False)
    country_name = Column(Text)
    country_code = Column(Text)
    currency_rate = Column(Numeric(12, 6))
