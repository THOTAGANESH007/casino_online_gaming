from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..dependencies.db import get_db
from ..models.tenants import Tenant

router = APIRouter(prefix="/tenants", tags=["Tenants"])

@router.post("/")
def create_tenant(
    tenant_name: str,
    default_timezone: str | None = None,
    default_currency: int | None = None,
    db: Session = Depends(get_db)
):
    tenant = Tenant(
        tenant_name=tenant_name,
        default_timezone=default_timezone,
        default_currency=default_currency
    )

    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    return tenant

@router.get("/")
def get_all_tenants(db: Session = Depends(get_db)):
    return db.query(Tenant).filter(Tenant.status == True).all()

@router.get("/{tenant_id}")
def get_tenant(tenant_id: int, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(404, "Tenant not found")
    return tenant

@router.patch("/{tenant_id}/disable")
def disable_tenant(tenant_id: int, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(404)

    tenant.status = False
    db.commit()

    return {"message": "Tenant disabled"}

@router.patch("/{tenant_id}/enable")
def enable_tenant(tenant_id: int, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(404)

    tenant.status = True
    db.commit()

    return {"message": "Tenant enabled"}

