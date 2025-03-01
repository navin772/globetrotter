from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
import random
import json
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets

# Initialize FastAPI app
app = FastAPI(title="Globetrotter API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = None
db = None

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_hex(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Models
class User(BaseModel):
    username: str
    score: int = 0
    correct_answers: int = 0
    total_answers: int = 0

class UserCreate(BaseModel):
    username: str

class Destination(BaseModel):
    city: str
    country: str
    clues: List[str]
    fun_fact: List[str]
    trivia: List[str]

class GameQuestion(BaseModel):
    clues: List[str]
    options: List[dict]
    correct_answer: str

class AnswerSubmission(BaseModel):
    selected_city: str
    correct_city: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

# Load destinations from JSON file
destinations = []

@app.on_event("startup")
async def startup_db_client():
    global client, db, destinations
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.globetrotter
    
    # Load destinations from JSON file
    try:
        with open("data.json", "r") as f:
            destinations = json.load(f)
    except FileNotFoundError:
        # Try relative path
        try:
            with open("backend/data.json", "r") as f:
                destinations = json.load(f)
        except FileNotFoundError:
            print("Error: Could not find data.json file")
            destinations = []
    
    # Check if destinations are already in the database
    count = await db.destinations.count_documents({})
    if count == 0:
        # Insert destinations into the database
        await db.destinations.insert_many(destinations)

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()

# Helper functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_random_question(num_options=4):
    # Get all destinations from the database
    cursor = db.destinations.find({})
    all_destinations = await cursor.to_list(length=None)
    
    if not all_destinations:
        raise HTTPException(status_code=404, detail="No destinations found")
    
    # Select a random destination as the correct answer
    correct_destination = random.choice(all_destinations)
    
    # Select 1-2 random clues from the correct destination
    num_clues = random.randint(1, 2)
    selected_clues = random.sample(correct_destination["clues"], min(num_clues, len(correct_destination["clues"])))
    
    # Select random destinations as options (including the correct one)
    other_destinations = [d for d in all_destinations if d["city"] != correct_destination["city"]]
    if len(other_destinations) < num_options - 1:
        num_options = len(other_destinations) + 1
    
    option_destinations = random.sample(other_destinations, num_options - 1)
    option_destinations.append(correct_destination)
    random.shuffle(option_destinations)
    
    options = [{"city": d["city"], "country": d["country"]} for d in option_destinations]
    
    return {
        "clues": selected_clues,
        "options": options,
        "correct_answer": correct_destination["city"]
    }

async def get_destination_by_city(city: str):
    destination = await db.destinations.find_one({"city": city})
    if not destination:
        raise HTTPException(status_code=404, detail=f"Destination {city} not found")
    return destination

async def update_user_score(username: str, correct: bool):
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail=f"User {username} not found")
    
    # Update user score
    update_data = {
        "$inc": {
            "total_answers": 1,
            "score": 1 if correct else 0,
            "correct_answers": 1 if correct else 0
        }
    }
    
    await db.users.update_one({"username": username}, update_data)
    return await db.users.find_one({"username": username})

# Routes
@app.get("/")
async def root():
    return {"message": "Welcome to Globetrotter API"}

@app.post("/users", response_model=Token)
async def create_user(user: UserCreate):
    # Check if username already exists
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user
    new_user = {
        "username": user.username,
        "score": 0,
        "correct_answers": 0,
        "total_answers": 0,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(new_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }

@app.get("/users/{username}")
async def get_user(username: str):
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail=f"User {username} not found")
    
    # Convert ObjectId to string for JSON serialization
    user["_id"] = str(user["_id"])
    return user

@app.get("/game/question", response_model=GameQuestion)
async def get_question():
    return await get_random_question()

@app.post("/game/answer")
async def submit_answer(answer: AnswerSubmission, username: Optional[str] = None):
    correct = answer.selected_city == answer.correct_city
    
    # Get fun fact for the correct destination
    destination = await get_destination_by_city(answer.correct_city)
    fun_fact = random.choice(destination["fun_fact"]) if destination["fun_fact"] else ""
    
    # Update user score if username is provided
    user = None
    if username:
        user = await update_user_score(username, correct)
        user["_id"] = str(user["_id"])
    
    return {
        "correct": correct,
        "fun_fact": fun_fact,
        "user": user
    }

@app.get("/game/challenge/{username}")
async def get_challenge_info(username: str):
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail=f"User {username} not found")
    
    # Convert ObjectId to string for JSON serialization
    user["_id"] = str(user["_id"])
    
    return {
        "username": user["username"],
        "score": user["score"],
        "correct_answers": user["correct_answers"],
        "total_answers": user["total_answers"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)