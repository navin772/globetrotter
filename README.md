# Globetrotter

Globetrotter is a full-stack web application where users get cryptic clues about famous places and must guess which destination it refers to. Once they guess, they'll unlock fun facts, trivia, and surprises about the destination!

## Project Structure

The project is divided into two main parts:

- **Backend**: Python FastAPI application with MongoDB Atlas database
- **Frontend**: React.js application with styled-components

## Features

- 🌍 Random destination questions with cryptic clues
- 🎮 Multiple-choice answers with immediate feedback
- 🎉 Animations for correct/incorrect answers
- 📊 Score tracking system
- 👥 User registration with unique usernames
- 🔗 "Challenge a Friend" feature with shareable links
- 📱 Responsive design for all devices

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Install dependencies:
```
pip install -r requirements.txt
```

3. Create a `.env` file with your MongoDB Atlas credentials:
```
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
SECRET_KEY=your_secret_key
```

Note: The MongoDB URI will be constructed in the code with proper escaping of the username and password.

4. Run the server:
```
python run.py
```

The backend will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
```
cd frontend
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file with the following content:
```
REACT_APP_API_URL=http://localhost:8000
```

4. Start the development server:
```
npm start
```

The frontend will be available at http://localhost:3000

## Running the Application

You can use the provided script to run both the backend and frontend:

```
./run_app.sh
```

## Deployment

### Backend Deployment on Vercel

1. Make sure you have the Vercel CLI installed:
```
npm install -g vercel
```

2. Set up your environment variables in Vercel:
```
vercel secrets add mongodb_username your_username
vercel secrets add mongodb_password your_password
vercel secrets add secret_key your_secret_key
```

3. Deploy the backend:
```
cd backend
vercel
```

### Frontend Deployment on Vercel

1. Update the `.env` file with your deployed backend URL:
```
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

2. Deploy the frontend:
```
cd frontend
vercel
```

## MongoDB Atlas Setup

The application uses MongoDB Atlas for the database. The data is stored in:

- Database: `city_data`
- Collection: `cities`

The collection contains documents with the following structure:
```json
{
  "city": "City Name",
  "country": "Country Name",
  "clues": ["Clue 1", "Clue 2"],
  "fun_fact": ["Fun Fact 1", "Fun Fact 2"],
  "trivia": ["Trivia 1", "Trivia 2"]
}
```

## Dataset

The application uses a dataset of famous destinations with:
- City and country information
- Cryptic clues about each destination
- Fun facts and trivia

The dataset is stored on the backend to prevent users from accessing all questions and answers through the browser.

## Future Enhancements

- Add more destinations to the dataset
- Implement difficulty levels
- Add timed challenges
- Create leaderboards
- Add more social sharing options
- Implement user authentication with OAuth

## License

This project is licensed under the MIT License - see the LICENSE file for details.