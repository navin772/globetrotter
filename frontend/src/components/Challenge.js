import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { UserContext } from '../context/UserContext';
import { getChallengeInfo, createUser } from '../services/api';

const ChallengeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #1e5799 0%, #207cca 51%, #2989d8 100%);
  color: white;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  cursor: pointer;
`;

const ChallengeCard = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const ScoreDisplay = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
`;

const ScoreText = styled.p`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
`;

const ScoreDetails = styled.p`
  font-size: 1.2rem;
  opacity: 0.8;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const Input = styled.input`
  padding: 12px;
  margin-bottom: 1rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 12px;
  background-color: ${props => props.secondary ? '#6c757d' : '#ff6b6b'};
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin: ${props => props.margin || '0'};

  &:hover {
    background-color: ${props => props.secondary ? '#5a6268' : '#ff5252'};
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  margin-top: 1rem;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  text-align: center;
`;

const Challenge = () => {
  const { username } = useParams();
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const { user, login } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallengeInfo = async () => {
      setLoading(true);
      setError('');
      
      try {
        const data = await getChallengeInfo(username);
        setChallengeInfo(data);
      } catch (err) {
        setError('Failed to load challenge information. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchChallengeInfo();
    }
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newUsername.trim()) {
      setError('Please enter a username');
      return;
    }
    
    setFormLoading(true);
    setError('');
    
    try {
      const userData = await createUser(newUsername);
      login(userData);
      navigate('/game');
    } catch (err) {
      setError(err.detail || 'Failed to create user. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePlayAsGuest = () => {
    navigate('/game');
  };

  if (loading) {
    return (
      <ChallengeContainer>
        <Header>
          <Logo onClick={() => navigate('/')}>🌍 Globetrotter</Logo>
        </Header>
        <LoadingText>Loading challenge information...</LoadingText>
      </ChallengeContainer>
    );
  }

  if (error && !challengeInfo) {
    return (
      <ChallengeContainer>
        <Header>
          <Logo onClick={() => navigate('/')}>🌍 Globetrotter</Logo>
        </Header>
        <ChallengeCard>
          <ErrorMessage>{error}</ErrorMessage>
          <Button margin="1rem 0 0 0" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </ChallengeCard>
      </ChallengeContainer>
    );
  }

  return (
    <ChallengeContainer>
      <Header>
        <Logo onClick={() => navigate('/')}>🌍 Globetrotter</Logo>
      </Header>
      
      {challengeInfo && (
        <ChallengeCard>
          <Title>You've been challenged!</Title>
          <Subtitle>
            {challengeInfo.username} has challenged you to beat their score in Globetrotter.
          </Subtitle>
          
          <ScoreDisplay>
            <ScoreText>{challengeInfo.score} points</ScoreText>
            <ScoreDetails>
              {challengeInfo.correct_answers} correct out of {challengeInfo.total_answers} questions
            </ScoreDetails>
          </ScoreDisplay>
          
          {user ? (
            <Button onClick={() => navigate('/game')}>
              Accept Challenge
            </Button>
          ) : (
            <>
              <Form onSubmit={handleSubmit}>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={formLoading}
                />
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Loading...' : 'Accept Challenge'}
                </Button>
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </Form>
              
              <Button 
                secondary 
                margin="1rem 0 0 0" 
                onClick={handlePlayAsGuest}
              >
                Play as Guest
              </Button>
            </>
          )}
        </ChallengeCard>
      )}
    </ChallengeContainer>
  );
};

export default Challenge;