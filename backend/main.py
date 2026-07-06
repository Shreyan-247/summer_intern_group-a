from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import SQLModel, create_engine, Session, select
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from pydantic import BaseModel

from models import User, Playlist, Video, UserProgress, XpLog

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up: Creating database tables in CockroachDB ")
    SQLModel.metadata.create_all(engine)
    yield
    print("Shutting down ")

app = FastAPI(title='LMS Core API', lifespan=lifespan)

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_session():
    with Session(engine) as session:
        yield session

class UserRegister(BaseModel):
    email: str
    password: str

@app.post("/api/auth/register")
def register(user_data: UserRegister, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = pwd_context.hash(user_data.password)

    new_user = User(email=user_data.email, hashed_password=hashed)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {"message": "User registered successfully", "user_id": new_user.id}

@app.get('/')
def read_root():
    return {"message": "Hello World! The api is running."}