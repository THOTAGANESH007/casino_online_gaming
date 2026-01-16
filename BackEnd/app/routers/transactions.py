from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies.db import get_db
from ..schemas.wallets import WalletTxnCreate, WalletResponse
from ..models.wallets import Wallet, WalletTransaction

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/add-money")
def add_money(
    wallet_id: int,
    data: WalletTxnCreate,
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.wallet_id == wallet_id).first()
    if not wallet:
        raise HTTPException(404, "Wallet not found")

    wallet.balance += data.amount

    txn = WalletTransaction(
        wallet_id=wallet.wallet_id,
        txn_type=data.txn_type,
        txn_direction=data.txn_direction,
        amount=data.amount,
        txn_status="success"
    )

    db.add(txn)
    db.commit()

    return {"balance": wallet.balance}

@router.get("/balance")
def fetch_balance(
    wallet_id: int,
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.wallet_id == wallet_id).first()
    if not wallet:
        raise HTTPException(404, "Wallet not found")
    return WalletResponse.from_orm(wallet)
