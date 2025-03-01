# Globetrotter

Globetrotter is a full-stack web application where users get cryptic clues about famous places and must guess which destination it refers to. Once they guess, they'll unlock fun facts, trivia, and surprises about the destination!

## Project Structure

The project is divided into two main parts:

- **Backend**: Python FastAPI application with MongoDB database
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
- MongoDB

### Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Install dependencies:
```
pip install -r requirements.txt
```

3. Make sure MongoDB is running on your system or set the MONGODB_URL environment variable.

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

## Deployment

### Backend Deployment

The backend can be deployed to any platform that supports Python applications, such as:
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform

### Frontend Deployment

The frontend is designed to be easily deployed to:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

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