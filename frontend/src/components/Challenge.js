import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Confetti from 'react-confetti';
import { UserContext } from '../context/UserContext';
import { getChallengeInfo, createUser } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from '../hooks/useToast';
import {
  Container,
  Card,
  Button,
  Input,
  Header,
  Logo,
  colors,
} from '../styles/SharedStyles';

const ChallengeCard = styled(Card)`
  text-align: center;
  max-width: 600px;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, ${colors.accent}, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
`;

const ScoreDisplay = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary});
    border-radius: 17px;
    z-index: -1;
    opacity: 0.5;
  }
`;

const ScoreText = styled.p`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: ${colors.accent};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const ScoreDetails = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  gap: 1rem;
`;

const ErrorMessage = styled.p`
  color: ${colors.error};
  background: rgba(255, 82, 82, 0.1);
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  border: 1px solid rgba(255, 82, 82, 0.3);
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
`;

const Popup = styled(Card)`
  background: white;
  color: ${colors.primary};
  max-width: 500px;
  position: relative;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const PopupTitle = styled.h3`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: ${colors.primary};
  text-align: center;
`;

const PopupText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: ${colors.primary};
  line-height: 1.6;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: ${colors.primary};
  opacity: 0.6;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  ${Button} {
    flex: 1;
  }
`;

const Challenge = () => {
  const { username } = useParams();
  const { showToast } = useToast();
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [acceptedUser, setAcceptedUser] = useState(null);
  const { user, login } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallengeInfo = async () => {
      setLoading(true);
      setError('');
      
      try {
        const data = await getChallengeInfo(username);
        setChallengeInfo(data);
        showToast(`Challenge from ${data.username} loaded! 🎮`, 'info');
      } catch (err) {
        setError('Failed to load challenge information. Please try again.');
        showToast('Failed to load challenge information. Please try again.', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchChallengeInfo();
    }
  }, [username, showToast]);

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
      setAcceptedUser(userData);
      setShowPopup(true);
      setShowConfetti(true);
      showToast(`Welcome ${userData.username}! Challenge accepted! 🎮`, 'success');
    } catch (err) {
      setError(err.detail || 'Failed to create user. Please try again.');
      showToast(err.detail || 'Failed to create user. Please try again.', 'error');
      setFormLoading(false);
    }
  };

  const handlePlayAsGuest = () => {
    setAcceptedUser({
      username: "Guest",
      score: 0,
      correct_answers: 0,
      total_answers: 0
    });
    setShowPopup(true);
    setShowConfetti(true);
  };
  
  const handleClosePopup = () => {
    setShowPopup(false);
    setShowConfetti(false);
    navigate('/game');
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Logo onClick={() => navigate('/')}>🌍 Globetrotter</Logo>
        </Header>
        <LoadingSpinner text="Loading challenge information..." />
      </Container>
    );
  }

  if (error && !challengeInfo) {
    return (
      <Container>
        <Header>
          <Logo onClick={() => navigate('/')}>🌍 Globetrotter</Logo>
        </Header>
        <ChallengeCard>
          <ErrorMessage>{error}</ErrorMessage>
          <Button onClick={() => navigate('/')}>
            Return Home
          </Button>
        </ChallengeCard>
      </Container>
    );
  }

  return (
    <Container>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <Header>
        <Logo onClick={() => navigate('/')}>🌍 Globetrotter</Logo>
      </Header>
      
      {challengeInfo && (
        <ChallengeCard>
          <Title>Challenge Accepted? 🏆</Title>
          <Subtitle>
            {challengeInfo.username} has challenged you to beat their score in Globetrotter!
          </Subtitle>
          
          <ScoreDisplay
            role="region"
            aria-label="Challenge score details"
          >
            <ScoreText aria-label={`Score: ${challengeInfo.score} points`}>
              {challengeInfo.score} points
            </ScoreText>
            <ScoreDetails>
              <span aria-label={`${challengeInfo.correct_answers} correct answers out of ${challengeInfo.total_answers} total questions`}>
                {challengeInfo.correct_answers} correct out of {challengeInfo.total_answers} questions
              </span>
            </ScoreDetails>
          </ScoreDisplay>

          {/* Add keyboard trap handling for popup */}
          {showPopup && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  // Trap focus within popup
                  const focusableElements = document.querySelector('[role="dialog"]')
                    .querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                  const firstFocusableElement = focusableElements[0];
                  const lastFocusableElement = focusableElements[focusableElements.length - 1];

                  function handleTabKey(e) {
                    if (e.key === 'Tab') {
                      if (e.shiftKey) {
                        if (document.activeElement === firstFocusableElement) {
                          lastFocusableElement.focus();
                          e.preventDefault();
                        }
                      } else {
                        if (document.activeElement === lastFocusableElement) {
                          firstFocusableElement.focus();
                          e.preventDefault();
                        }
                      }
                    }
                  }

                  document.addEventListener('keydown', handleTabKey);
                  firstFocusableElement.focus();
                `
              }}
            />
          )}
          
          {user ? (
            <Button onClick={() => {
              setAcceptedUser(user);
              setShowPopup(true);
              setShowConfetti(true);
            }}>
              Accept Challenge
            </Button>
          ) : (
            <>
              <Form 
                onSubmit={handleSubmit}
                role="form"
                aria-label="Challenge acceptance form"
              >
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={formLoading}
                  aria-label="Username input"
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby={error ? "username-error" : undefined}
                />
                <Button 
                  type="submit" 
                  disabled={formLoading}
                  aria-busy={formLoading}
                >
                  {formLoading ? 'Loading...' : 'Accept Challenge'}
                </Button>
                {error && (
                  <ErrorMessage 
                    id="username-error" 
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </ErrorMessage>
                )}
              </Form>
              
              <Button
                secondary
                onClick={handlePlayAsGuest}
                style={{ marginTop: '1rem' }}
              >
                Play as Guest
              </Button>
            </>
          )}
        </ChallengeCard>
      )}
      
      {showPopup && (
        <Overlay
          role="dialog"
          aria-modal="true"
          aria-labelledby="challenge-popup-title"
        >
          <Popup>
            <CloseButton 
              onClick={handleClosePopup}
              aria-label="Close popup"
            >
              &times;
            </CloseButton>
            <PopupTitle id="challenge-popup-title">
              Challenge Accepted! 🎉
            </PopupTitle>
            <PopupText>
              {acceptedUser?.username}, are you ready to take on {challengeInfo?.username}'s challenge?
            </PopupText>
            <PopupText>
              Beat their score of {challengeInfo?.score} points to win!
            </PopupText>
            <ButtonGroup>
              <Button 
                onClick={handleClosePopup}
                aria-label="Start playing the challenge"
              >
                Let's Play!
              </Button>
            </ButtonGroup>
          </Popup>
        </Overlay>
      )}
    </Container>
  );
};

export default Challenge;
