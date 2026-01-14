from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags = ["Admin"])

@router.get("/get-all-users")
def get_all_users():
    pass

@router.get("/fetch-tenants")
def get_all_tenants():
    pass

@router.get("/fetch-game-providers")
def get_game_providers():
    pass

@router.get("/get-affiliates")
def get_affiliates():
    pass

