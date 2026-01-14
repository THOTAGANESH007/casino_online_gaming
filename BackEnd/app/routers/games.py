from fastapi import APIRouter

router = APIRouter(prefix="/game", tags=["Games"])

@router.get("/{game_name}")
def fetch_game(game_name: str):
    pass

