from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies.db import get_db
from ..models.tenants import TenantRegion, Tenant

router = APIRouter(prefix="/regions", tags=["Regions"])

@router.post("/")
def create_region(
    tenant_id: int,
    time_zone: str,
    tax_rate: float,
    db: Session = Depends(get_db)
):
    tenant = db.query(Tenant).filter(
        Tenant.tenant_id == tenant_id,
        Tenant.status == True
    ).first()

    if not tenant:
        raise HTTPException(400, "Invalid tenant")

    region = TenantRegion(
        tenant_id=tenant_id,
        time_zone=time_zone,
        tax_rate=tax_rate
    )

    db.add(region)
    db.commit()
    db.refresh(region)

    return region

@router.get("/public")
def get_regions_for_signup(db: Session = Depends(get_db)):
    return (
        db.query(TenantRegion)
        .join(Tenant)
        .filter(Tenant.status == True)
        .all()
    )


@router.get("/tenant/{tenant_id}")
def get_regions_by_tenant(
    tenant_id: int,
    db: Session = Depends(get_db)
):
    return db.query(TenantRegion).filter(
        TenantRegion.tenant_id == tenant_id
    ).all()


@router.patch("/{region_id}")
def update_region(
    region_id: int,
    time_zone: str | None = None,
    tax_rate: float | None = None,
    db: Session = Depends(get_db)
):
    region = db.query(TenantRegion).filter(
        TenantRegion.region_id == region_id
    ).first()

    if not region:
        raise HTTPException(404)

    if time_zone:
        region.time_zone = time_zone
    if tax_rate is not None:
        region.tax_rate = tax_rate

    db.commit()
    return region


@router.delete("/{region_id}")
def delete_region(region_id: int, db: Session = Depends(get_db)):
    region = db.query(TenantRegion).filter(
        TenantRegion.region_id == region_id
    ).first()

    if not region:
        raise HTTPException(404)

    db.delete(region)
    db.commit()

    return {"message": "Region deleted"}
