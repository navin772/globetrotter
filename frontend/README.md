# Globetrotter Frontend

This is the frontend for the Globetrotter application, a game where users get cryptic clues about famous places and must guess the destination.

## Features

- User registration with unique usernames
- Random destination questions with clues
- Multiple-choice answers with immediate feedback
- Score tracking
- "Challenge a Friend" feature with shareable links
- Responsive design for all devices

## Setup

1. Install dependencies:
```
npm install
```

2. Create a `.env` file in the root directory with the following content:
```
REACT_APP_API_URL=http://localhost:8000
```

3. Start the development server:
```
npm start
```

The app will be available at http://localhost:3000

## Building for Production

To create a production build:
```
npm run build
```

This will create a `build` folder with optimized production files that can be deployed to services like Vercel or Netlify.

## Deployment

This app is designed to be easily deployed to Vercel or Netlify:

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel deploy` in the project directory
3. Follow the prompts to deploy

### Netlify
1. Create a `netlify.toml` file in the root directory:
```
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
2. Deploy using Netlify CLI or connect your GitHub repository to Netlify

## Environment Variables

- `REACT_APP_API_URL`: URL of the backend API (default: http://localhost:8000)
