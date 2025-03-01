import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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