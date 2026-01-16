from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users,admin,affiliates,bets,games,transactions,tenants

app = FastAPI()
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],      # GET, POST, PUT, DELETE
    allow_headers=["*"],      # Authorization, Content-Type
)

app.include_router(tenants.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(affiliates.router)
app.include_router(bets.router)
app.include_router(games.router)
app.include_router(transactions.router)