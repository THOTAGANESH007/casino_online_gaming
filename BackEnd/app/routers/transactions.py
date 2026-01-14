from fastapi import APIRouter

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/add-money")
def add_money():
    pass

@router.get("/fetch-money-balance")
def fetch_money_balance():
    pass

@router.get("/fetch-bonus-balance")
def fetch_bonus_balance():
    pass

