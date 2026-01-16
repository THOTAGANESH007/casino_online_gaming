from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models.user import User, UserKYC
from ..models.tenant import Tenant, TenantRegion
from ..schemas.tenant import TenantCreate, TenantResponse, RegionCreate, RegionResponse
from ..schemas.user import UserResponse
from ..utils.dependencies import require_admin
from ..services.email_service import email_service

router = APIRouter(prefix="/admin", tags=["Admin"])

# ============= TENANT MANAGEMENT =============

@router.post("/tenants", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant_data: TenantCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Create a new tenant"""
    
    new_tenant = Tenant(
        tenant_name=tenant_data.tenant_name,
        default_timezone=tenant_data.default_timezone,
        default_currency=tenant_data.default_currency,
        status=True
    )
    
    db.add(new_tenant)
    db.commit()
    db.refresh(new_tenant)
    
    return new_tenant

@router.get("/tenants", response_model=List[TenantResponse])
async def get_all_tenants(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get all tenants"""
    tenants = db.query(Tenant).all()
    return tenants

@router.get("/tenants/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get a specific tenant"""
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    return tenant

@router.patch("/tenants/{tenant_id}/status")
async def update_tenant_status(
    tenant_id: int,
    status: bool,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Enable or disable a tenant"""
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    tenant.status = status
    db.commit()
    
    return {"message": f"Tenant {'enabled' if status else 'disabled'} successfully"}

# ============= REGION MANAGEMENT =============

@router.post("/regions", response_model=RegionResponse, status_code=status.HTTP_201_CREATED)
async def create_region(
    region_data: RegionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Create a new region for a tenant"""
    
    # Verify tenant exists
    tenant = db.query(Tenant).filter(Tenant.tenant_id == region_data.tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    new_region = TenantRegion(
        tenant_id=region_data.tenant_id,
        time_zone=region_data.time_zone,
        tax_rate=region_data.tax_rate
    )
    
    db.add(new_region)
    db.commit()
    db.refresh(new_region)
    
    return new_region

@router.get("/regions", response_model=List[RegionResponse])
async def get_all_regions(
    tenant_id: int = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get all regions, optionally filtered by tenant"""
    query = db.query(TenantRegion)
    if tenant_id:
        query = query.filter(TenantRegion.tenant_id == tenant_id)
    
    regions = query.all()
    return regions

# ============= USER & KYC MANAGEMENT =============

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    tenant_id: int = None,
    is_active: bool = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get all users with optional filters"""
    query = db.query(User)
    
    if tenant_id:
        query = query.filter(User.tenant_id == tenant_id)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.all()
    return users

@router.get("/kyc/pending")
async def get_pending_kyc(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get all pending KYC verifications"""
    pending_kyc = db.query(UserKYC).filter(
        UserKYC.verified_status == False
    ).all()
    
    result = []
    for kyc in pending_kyc:
        user = db.query(User).filter(User.user_id == kyc.user_id).first()
        result.append({
            "kyc_id": kyc.kyc_id,
            "user_id": kyc.user_id,
            "user_name": f"{user.first_name} {user.last_name or ''}",
            "email": user.email,
            "document_type": kyc.document_type,
            "document_number": kyc.document_number
        })
    
    return result

@router.post("/kyc/{kyc_id}/approve")
async def approve_kyc(
    kyc_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Approve KYC verification"""
    
    kyc = db.query(UserKYC).filter(UserKYC.kyc_id == kyc_id).first()
    if not kyc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KYC record not found"
        )
    
    # Mark KYC as verified
    kyc.verified_status = True
    kyc.verified_at = datetime.utcnow()
    
    db.commit()
    
    # Get user
    user = db.query(User).filter(User.user_id == kyc.user_id).first()
    
    # Send email
    await email_service.send_kyc_approval_email(
        user.email,
        user.first_name
    )
    
    return {"message": "KYC approved successfully"}

@router.post("/kyc/{kyc_id}/reject")
async def reject_kyc(
    kyc_id: int,
    reason: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Reject KYC verification"""
    
    kyc = db.query(UserKYC).filter(UserKYC.kyc_id == kyc_id).first()
    if not kyc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KYC record not found"
        )
    
    # Get user
    user = db.query(User).filter(User.user_id == kyc.user_id).first()
    
    # Delete KYC record (user can resubmit)
    db.delete(kyc)
    db.commit()
    
    # Send email
    await email_service.send_kyc_rejection_email(
        user.email,
        user.first_name,
        reason
    )
    
    return {"message": "KYC rejected"}

@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Activate a user account"""
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if KYC is verified
    kyc = db.query(UserKYC).filter(UserKYC.user_id == user_id).first()
    if not kyc or not kyc.verified_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="KYC must be verified before activation"
        )
    
    # Activate user
    user.is_active = True
    db.commit()
    
    # Send activation email
    await email_service.send_activation_email(
        user.email,
        user.first_name
    )
    
    return {"message": "User activated successfully"}

@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Deactivate a user account"""
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}