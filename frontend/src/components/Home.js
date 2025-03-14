import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { UserContext } from '../context/UserContext';
import { createUser } from '../services/api';
import { useToast } from '../hooks/useToast';
import {
  Container,
  Card,
  Button,
  Input,
  Logo,
  Badge,
} from '../styles/SharedStyles';
import { animationMixins } from '../styles/animations';

const WelcomeBadge = styled(Badge)`
  position: absolute;
  top: 20px;
  right: 20px;
  ${animationMixins.slideInRight}
`;

const GlobeEmoji = styled.span`
  font-size: 3rem;
  margin-bottom: 1rem;
  display: inline-block;
  ${animationMixins.bounce}
`;

const Title = styled(Logo)`
  font-size: 4.5rem;
  margin-bottom: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.4rem;
  margin-bottom: 3rem;
  text-align: center;
  max-width: 600px;
  line-height: 1.6;
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.9);
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
`;

const Form = styled(Card)`
  max-width: 400px;
  display: flex;
  flex-direction: column;
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 10px;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
`;

const Home = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useContext(UserContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/game');
    }
  }, [user, navigate]);

  return (
    <Container>
      <WelcomeBadge>
        Ready to explore? 🌟
      </WelcomeBadge>
      
      <GlobeEmoji>🌍</GlobeEmoji>
      <Title>Globetrotter</Title>
      <Subtitle>
        Test your knowledge of world destinations! Get cryptic clues and guess the famous place.
      </Subtitle>
      
      <Form as="form" onSubmit={async (e) => {
        e.preventDefault();
        
        if (!username.trim()) {
          showToast('Please enter a username', 'error');
          setError('Please enter a username');
          return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
          const userData = await createUser(username);
          login(userData);
          showToast(`Welcome ${userData.username}! Let's explore! 🌎`, 'success');
          navigate('/game');
        } catch (err) {
          setError(err.detail || 'Failed to create user. Please try again.');
          showToast(err.detail || 'Failed to create user. Please try again.', 'error');
        } finally {
          setIsLoading(false);
        }
      }}>
        <Input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} animated>
          {isLoading ? 'Loading...' : 'Start Adventure'}
        </Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </Container>
  );
};

export default Home;
