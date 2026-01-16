from ..database import Base
from sqlalchemy import (Column, Integer, Numeric, Text, Boolean, ForeignKey, TIMESTAMP)
from sqlalchemy.sql import func


class Tenant(Base):
    __tablename__ = "tenants"

    tenant_id = Column(Integer, primary_key=True)
    tenant_name = Column(Text, nullable=False)
    default_timezone = Column(Text)
    status = Column(Boolean, default=True)
    default_currency = Column(Integer, ForeignKey("country_currency_codes.cc_id"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class TenantRegion(Base):
    __tablename__ = "tenant_regions"

    region_id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"))
    time_zone = Column(Text)
    tax_rate = Column(Numeric(5, 2))