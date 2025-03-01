import axios from 'axios';

// Get API URL from environment or use localhost as fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('API URL:', API_URL); // Log the API URL for debugging

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent long-hanging requests
  timeout: 15000,
  // Don't use credentials for CORS
  withCredentials: false,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Network errors
    if (!error.response) {
      return Promise.reject({ 
        detail: 'Network error. Please check your connection and try again.' 
      });
    }
    
    // Server errors
    if (error.response.status >= 500) {
      return Promise.reject({ 
        detail: 'Server error. Please try again later.' 
      });
    }
    
    // Return the error response data or a default message
    return Promise.reject(
      error.response.data || { detail: 'Something went wrong. Please try again.' }
    );
  }
);

export const createUser = async (username) => {
  try {
    const response = await api.post('/users', { username });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to create user' };
  }
};

export const getUser = async (username) => {
  try {
    const response = await api.get(`/users/${username}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to get user' };
  }
};

export const getQuestion = async () => {
  try {
    const response = await api.get('/game/question');
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to get question' };
  }
};

export const submitAnswer = async (selectedCity, correctCity, username = null) => {
  try {
    const response = await api.post('/game/answer', {
      selected_city: selectedCity,
      correct_city: correctCity,
    }, {
      params: username ? { username } : {}
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to submit answer' };
  }
};

export const getChallengeInfo = async (username) => {
  try {
    const response = await api.get(`/game/challenge/${username}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to get challenge info' };
  }
};

export default api;