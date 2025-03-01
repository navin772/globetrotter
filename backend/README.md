# Globetrotter Backend

This is the backend for the Globetrotter application, a game where users get cryptic clues about famous places and must guess the destination.

## Setup

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Make sure MongoDB is running on your system or set the MONGODB_URL environment variable to point to your MongoDB instance.

3. Run the server:
```
python run.py
```

The server will start on http://localhost:8000

## API Endpoints

- `GET /`: Welcome message
- `POST /users`: Create a new user
- `GET /users/{username}`: Get user information
- `GET /game/question`: Get a random question with clues and options
- `POST /game/answer`: Submit an answer and get feedback
- `GET /game/challenge/{username}`: Get challenge information for a user

## Environment Variables

- `MONGODB_URL`: MongoDB connection string (default: mongodb://localhost:27017)
- `SECRET_KEY`: Secret key for JWT token generation