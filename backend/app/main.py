from fastapi import FastAPI, HTTPException, Depends, status, Request, Response
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
from functools import lru_cache

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Globetrotter API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add CORS preflight handler for all routes
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    response = Response()
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    return response

# Add middleware to ensure CORS headers are added to all responses
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    try:
        response = await call_next(request)
        # Add CORS headers to the response
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return response
    except Exception as e:
        # If an error occurs, create a response with CORS headers
        error_response = Response(
            content=json.dumps({"detail": str(e)}),
            status_code=500,
            media_type="application/json"
        )
        error_response.headers["Access-Control-Allow-Origin"] = "*"
        error_response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        error_response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return error_response

# Database connection
MONGODB_USERNAME = os.getenv("MONGODB_USERNAME", "")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD", "")
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


# Function to get a database connection - cached to reduce connection overhead
@lru_cache(maxsize=1)
def get_database_connection():
    """Get a MongoDB connection and return the client and database"""
    try:
        print(
            f"Creating new MongoDB connection to {MONGODB_URI.replace(MONGODB_PASSWORD, '********') if MONGODB_PASSWORD else MONGODB_URI}")

        # Connect to MongoDB Atlas with a timeout
        client = MongoClient(
            MONGODB_URI,
            server_api=ServerApi('1'),
            connectTimeoutMS=5000,
            socketTimeoutMS=5000,
            serverSelectionTimeoutMS=5000
        )

        # Ping the database to confirm connection
        client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas!")

        # Use the city_data database
        db = client.city_data

        return client, db
    except Exception as e:
        print(f"Error connecting to MongoDB Atlas: {str(e)}")
        raise


# Dependency for routes that need database access
async def get_db():
    """Dependency that provides database access"""
    try:
        client, db = get_database_connection()
        yield db
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")


# Now update your debug endpoint to use this dependency
@app.get("/debug/database")
async def debug_database(db=Depends(get_db)):
    """Debug endpoint to check database connection"""
    try:
        # Check collections
        collections = db.list_collection_names()

        # Count documents in collections
        collection_counts = {}
        for collection in collections:
            collection_counts[collection] = db[collection].count_documents({})

        return {
            "status": "connected",
            "database_name": db.name,
            "collections": collections,
            "document_counts": collection_counts,
            "mongodb_uri": MONGODB_URI.replace(MONGODB_PASSWORD, "********") if MONGODB_PASSWORD else "Not set"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/health")
async def health_check():
    """Health check endpoint that also validates database connection"""
    try:
        # Try to get a database connection directly for the health check
        client, db = get_database_connection()

        # Try to ping the database
        client.admin.command('ping')

        # Check if we can query the cities collection
        city_count = db.cities.count_documents({})

        return {
            "status": "healthy",
            "database": "connected",
            "cities_count": city_count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "error",
            "error": str(e)
        }

@app.on_event("startup")
def startup_db_client():
    global client, db
    try:
        print(f"Connecting to MongoDB with URI: {MONGODB_URI.replace(MONGODB_PASSWORD, '********') if MONGODB_PASSWORD else MONGODB_URI}")
        
        # Connect to MongoDB Atlas with a timeout
        client = MongoClient(MONGODB_URI, server_api=ServerApi('1'), connectTimeoutMS=5000, socketTimeoutMS=5000)
        
        # Ping the database to confirm connection
        client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas!")
        
        # Use the city_data database and cities collection
        db = client.city_data
        
        # Check if we can access the cities collection
        cities_count = db.cities.count_documents({})
        print(f"Found {cities_count} cities in the database")
        
        # Check if users collection exists, create it if not
        if 'users' not in db.list_collection_names():
            print("Creating users collection")
            db.create_collection('users')
        
        users_count = db.users.count_documents({})
        print(f"Found {users_count} users in the database")

        # List the usernames of all found users
        if users_count > 0:
            users_list = list(db.users.find({}, {'username': 1, '_id': 0}))
            usernames = [user['username'] for user in users_list]
            print(f"Registered users: {', '.join(usernames)}")
        
    except Exception as e:
        print(f"Error connecting to MongoDB Atlas: {str(e)}")
        # Don't raise the exception, just log it
        # This allows the app to start even if the database connection fails
        # We'll handle database errors in the individual endpoints

@app.on_event("shutdown")
def shutdown_db_client():
    if client:
        client.close()
        print("MongoDB connection closed")

# Helper functions
def get_random_question(db, num_options=4):
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


def get_destination_by_city(db, city: str):
    destination = db.cities.find_one({"city": city})
    if not destination:
        raise HTTPException(status_code=404, detail=f"Destination {city} not found")
    return destination


def update_user_score(db, username: str, correct: bool):
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

@app.get("/debug")
async def debug_info(request: Request):
    """Debug endpoint to check request headers and environment"""
    return {
        "headers": dict(request.headers),
        "url": str(request.url),
        "method": request.method,
        "env": {
            "MONGODB_USERNAME": os.environ.get("MONGODB_USERNAME", "Not set"),
            "SECRET_KEY": "***" if os.environ.get("SECRET_KEY") else "Not set",
            "VERCEL_ENV": os.environ.get("VERCEL_ENV", "Not set"),
            "VERCEL_REGION": os.environ.get("VERCEL_REGION", "Not set")
        }
    }


@app.get("/users/{username}")
async def get_user(username: str, db=Depends(get_db)):
    try:
        print(f"Getting user: {username}")
        user = db.users.find_one({"username": username})
        if not user:
            print(f"User {username} not found")
            raise HTTPException(status_code=404, detail=f"User {username} not found")

        # Convert ObjectId to string for JSON serialization
        user["_id"] = str(user["_id"])
        print(f"Returning user: {user}")
        return user
    except Exception as e:
        error_msg = f"Error getting user: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/users")  # Remove response_model=Token to bypass validation
async def create_user(user: UserCreate, db=Depends(get_db)):
    try:
        print(f"Creating user: {user.username}")

        # Check if username already exists
        existing_user = db.users.find_one({"username": user.username})
        if existing_user:
            print(f"User {user.username} already exists")
            raise HTTPException(status_code=400, detail="Username already registered")

        # Create new user
        new_user = {
            "username": user.username,
            "score": 0,
            "correct_answers": 0,
            "total_answers": 0,
            "created_at": datetime.utcnow()
        }

        print(f"Inserting new user: {new_user}")
        result = db.users.insert_one(new_user)
        print(f"User created with ID: {result.inserted_id}")

        try:
            # Create access token
            print("Generating access token")
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.username}, expires_delta=access_token_expires
            )
            print(f"Access token generated successfully")
            
            # Create response
            response_data = {
                "access_token": access_token,
                "token_type": "bearer",
                "username": user.username
            }
            print(f"Returning response with username: {user.username}")
            return response_data
            
        except Exception as token_error:
            # If token generation fails, still return a successful response
            print(f"Error generating token: {str(token_error)}")
            return {
                "access_token": "",
                "token_type": "bearer",
                "username": user.username
            }
    except Exception as e:
        error_msg = f"Error creating user: {str(e)}"
        print(error_msg)
        
        # Create a direct response with CORS headers instead of raising an exception
        return Response(
            content=json.dumps({"detail": error_msg}),
            status_code=500,
            media_type="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
            }
        )


@app.get("/game/question", response_model=GameQuestion)
async def get_question(db=Depends(get_db)):
    try:
        print("Getting random question")
        # Update the get_random_question function to accept db as a parameter
        question = get_random_question(db)
        print(f"Returning question with correct answer: {question['correct_answer']}")
        return question
    except Exception as e:
        error_msg = f"Error getting question: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/game/answer")
async def submit_answer(answer: AnswerSubmission, username: Optional[str] = None, db=Depends(get_db)):
    try:
        print(f"Submitting answer: {answer.selected_city} for correct answer: {answer.correct_city}")
        print(f"Username received: {username}")
        correct = answer.selected_city == answer.correct_city
        print(f"Answer is correct: {correct}")

        # Get fun fact for the correct destination
        print(f"Getting destination for city: {answer.correct_city}")
        destination = get_destination_by_city(db, answer.correct_city)
        fun_fact = random.choice(destination["fun_fact"]) if destination["fun_fact"] else ""

        # Update user score if username is provided
        user = None
        if username:
            print(f"Updating score for user: {username}")
            user = update_user_score(db, username, correct)
            user["_id"] = str(user["_id"])

        response = {
            "correct": correct,
            "fun_fact": fun_fact,
            "user": user
        }
        print(f"Returning response: {response}")
        return response
    except Exception as e:
        error_msg = f"Error submitting answer: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


@app.get("/game/challenge/{username}")
async def get_challenge_info(username: str, db=Depends(get_db)):
    try:
        print(f"Getting challenge info for user: {username}")
        user = db.users.find_one({"username": username})
        if not user:
            print(f"User {username} not found")
            raise HTTPException(status_code=404, detail=f"User {username} not found")

        # Convert ObjectId to string for JSON serialization
        user["_id"] = str(user["_id"])

        response = {
            "username": user["username"],
            "score": user["score"],
            "correct_answers": user["correct_answers"],
            "total_answers": user["total_answers"]
        }
        print(f"Returning challenge info: {response}")
        return response
    except Exception as e:
        error_msg = f"Error getting challenge info: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)