from fastapi import APIRouter

router = APIRouter(prefix="/referral", tags=["Affiliates"])

@router.get("/players")
def get_players():
    pass

@router.get("/calculate-commission")
def earned_commission():
    pass

