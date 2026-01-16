from pydantic import BaseModel, ConfigDict
from datetime import datetime
from decimal import Decimal
from ..models.wallets import (WalletType, TxnType,TxnDirection, TxnStatus)


class WalletTxnCreate(BaseModel):
    amount: Decimal
    txn_type: TxnType
    txn_direction: TxnDirection


class WalletTxnResponse(BaseModel):
    txn_id: int
    amount: Decimal
    txn_status: TxnStatus
    txn_done_at: datetime

    model_config = ConfigDict(from_attributes = True)

class WalletResponse(BaseModel):
    wallet_id: int
    balance: Decimal
    wallet_type: WalletType

    model_config = ConfigDict(from_attributes = True)
