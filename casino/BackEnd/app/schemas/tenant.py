from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TenantCreate(BaseModel):
    tenant_name: str
    default_timezone: Optional[str] = None
    default_currency: Optional[str] = None

class TenantResponse(BaseModel):
    tenant_id: int
    tenant_name: str
    default_timezone: Optional[str]
    status: bool
    default_currency: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class RegionCreate(BaseModel):
    tenant_id: int
    time_zone: Optional[str] = None
    tax_rate: Optional[float] = None

class RegionResponse(BaseModel):
    region_id: int
    tenant_id: int
    time_zone: Optional[str]
    tax_rate: Optional[float]
    
    class Config:
        from_attributes = True
