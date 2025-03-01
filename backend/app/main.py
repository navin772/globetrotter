from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from pydantic import BaseModel
from typing import List, Optional
import random
import os
import json
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets
from dotenv import load_dotenv
import urllib.parse

# Load environment variables
load_dotenv()

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
MONGODB_USERNAME = os.getenv("MONGODB_USERNAME")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
# Escape username and password for MongoDB URI
if MONGODB_USERNAME and MONGODB_PASSWORD:
    escaped_username = urllib.parse.quote_plus(MONGODB_USERNAME)
    escaped_password = urllib.parse.quote_plus(MONGODB_PASSWORD)
    MONGODB_URI = os.getenv("MONGODB_URI", f"mongodb+srv://{escaped_username}:{escaped_password}@cluster0globe.5lwkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0globe")
else:
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

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

@app.on_event("startup")
def startup_db_client():
    global client, db
    try:
        # Connect to MongoDB Atlas
        client = MongoClient(MONGODB_URI, server_api=ServerApi('1'))
        
        # Ping the database to confirm connection
        client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas!")
        
        # Use the city_data database and cities collection
        db = client.city_data
        
        # Check if we can access the cities collection
        cities_count = db.cities.count_documents({})
        print(f"Found {cities_count} cities in the database")
        
    except Exception as e:
        print(f"Error connecting to MongoDB Atlas: {e}")
        raise

@app.on_event("shutdown")
def shutdown_db_client():
    if client:
        client.close()
        print("MongoDB connection closed")

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

def get_random_question(num_options=4):
    # Get all destinations from the database
    all_destinations = list(db.cities.find({}))
    
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

def get_destination_by_city(city: str):
    destination = db.cities.find_one({"city": city})
    if not destination:
        raise HTTPException(status_code=404, detail=f"Destination {city} not found")
    return destination

def update_user_score(username: str, correct: bool):
    user = db.users.find_one({"username": username})
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
    
    db.users.update_one({"username": username}, update_data)
    return db.users.find_one({"username": username})

# Routes
@app.get("/")
def root():
    return {"message": "Welcome to Globetrotter API"}

@app.post("/users", response_model=Token)
def create_user(user: UserCreate):
    # Check if username already exists
    existing_user = db.users.find_one({"username": user.username})
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
    
    db.users.insert_one(new_user)
    
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
def get_user(username: str):
    user = db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail=f"User {username} not found")
    
    # Convert ObjectId to string for JSON serialization
    user["_id"] = str(user["_id"])
    return user

@app.get("/game/question", response_model=GameQuestion)
def get_question():
    return get_random_question()

@app.post("/game/answer")
def submit_answer(answer: AnswerSubmission, username: Optional[str] = None):
    correct = answer.selected_city == answer.correct_city
    
    # Get fun fact for the correct destination
    destination = get_destination_by_city(answer.correct_city)
    fun_fact = random.choice(destination["fun_fact"]) if destination["fun_fact"] else ""
    
    # Update user score if username is provided
    user = None
    if username:
        user = update_user_score(username, correct)
        user["_id"] = str(user["_id"])
    
    return {
        "correct": correct,
        "fun_fact": fun_fact,
        "user": user
    }

@app.get("/game/challenge/{username}")
def get_challenge_info(username: str):
    user = db.users.find_one({"username": username})
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