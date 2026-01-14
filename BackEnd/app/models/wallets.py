from ..database import Base
from sqlalchemy import (
    Column, Integer, Numeric, String, Text, ForeignKey, TIMESTAMP, Enum, UniqueConstraint
)
import enum
from sqlalchemy.sql import func

class WalletType(str, enum.Enum):
    cash = "cash"
    bonus = "bonus"
    points = "points"

class TxnType(str, enum.Enum):
    upi = "upi"
    credit_card = "credit_card"
    debit_card = "debit_card"
    cash = "cash"

class TxnDirection(str, enum.Enum):
    credit = "credit"
    debit = "debit"

class TxnStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"


class Wallet(Base):
    __tablename__ = "wallet"
    __table_args__ = (
        UniqueConstraint("user_id", "wallet_type"),
    )

    wallet_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    balance = Column(Numeric(18, 2), default=0.00)
    currency_id = Column(Integer, ForeignKey("country_currency_codes.cc_id"))
    wallet_type = Column(Enum(WalletType), default=WalletType.cash)


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    txn_id = Column(Integer, primary_key=True)
    wallet_id = Column(Integer, ForeignKey("wallet.wallet_id"))
    txn_type = Column(Enum(TxnType))
    txn_direction = Column(Enum(TxnDirection), nullable=False)
    txn_status = Column(Enum(TxnStatus), default=TxnStatus.pending)
    amount = Column(Numeric(18, 2), nullable=False)
    reference_id = Column(String(40))
    txn_done_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class WalletLedger(Base):
    __tablename__ = "wallet_ledger"

    ledger_id = Column(Integer, primary_key=True)
    wallet_id = Column(Integer, ForeignKey("wallet.wallet_id"))
    before_balance = Column(Numeric(18, 2))
    after_balance = Column(Numeric(18, 2))
    reference_type = Column(Text)
    reference_id = Column(Integer)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
