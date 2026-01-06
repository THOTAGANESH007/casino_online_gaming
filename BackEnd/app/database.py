from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .core.config import settings

DATABASE_URL = settings.DATABASE_URL
print(DATABASE_URL)

engine = create_engine(DATABASE_URL, echo = True) # echo=True => To print the query in the console

SessionLocal = sessionmaker(bind = engine, autoflush = False, autocommit = False)

Base = declarative_base()
