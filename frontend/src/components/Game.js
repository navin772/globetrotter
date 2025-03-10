import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Confetti from 'react-confetti';
// eslint-disable-next-line no-unused-vars
import html2canvas from 'html2canvas';
import { UserContext } from '../context/UserContext';
import { useToast } from '../hooks/useToast';
import { getQuestion, submitAnswer } from '../services/api';
import {
  Container,
  Card,
  Button,
  Header,
  Logo,
  colors,
} from '../styles/SharedStyles';
import LoadingSpinner from './LoadingSpinner';

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Score = styled.div`
  font-size: 1.2rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

// Add button for "Challenge a Friend"
const ShareButton = styled(Button)`
  margin-left: 0.5rem;
  background: ${colors.secondary};
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  
  &:hover {
    background: ${colors.accent};
  }
`;

const ClueContainer = styled.div`
  margin-bottom: 2rem;
`;

const ClueTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: ${colors.accent};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const Clue = styled.p`
  font-size: 1.2rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 1.2rem;
  border-radius: 10px;
  margin-bottom: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  outline: none;
`;

const OptionButton = styled.button`
  padding: 1.2rem;
  background: ${props => {
    if (props.selected && props.result === 'correct') return colors.success;
    if (props.selected && props.result === 'incorrect') return colors.error;
    if (props.correct && props.result === 'incorrect') return colors.success;
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 1rem;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
  overflow: hidden;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${colors.accent};
    transform: translateY(-2px);
  }

  &:focus:not(:focus-visible) {
    box-shadow: none;
    transform: none;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${colors.accent};
    transform: translateY(-2px);
  }

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    background: ${props => props.disabled ? '' : 'rgba(255, 255, 255, 0.2)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 5px 15px rgba(0, 0, 0, 0.2)'};
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0)
    );
    transform: rotate(45deg);
    transition: all 0.3s ease;
    opacity: 0;
  }

  &:hover::after {
    opacity: ${props => props.disabled ? 0 : 1};
    transform: rotate(45deg) translate(50%, 50%);
  }
`;

const OptionCity = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
`;

const OptionCountry = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const FeedbackContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: ${props => props.correct ? 
    'rgba(76, 175, 80, 0.2)' : 
    'rgba(244, 67, 54, 0.2)'};
  border-radius: 10px;
  text-align: center;
  border: 1px solid ${props => props.correct ? 
    'rgba(76, 175, 80, 0.5)' : 
    'rgba(244, 67, 54, 0.5)'};
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FeedbackTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${props => props.correct ? colors.success : colors.error};
`;

const FeedbackText = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
`;

// eslint-disable-next-line no-unused-vars
const LoadingText = styled.p`
  font-size: 1.2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin: 2rem 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
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

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const SharePopup = styled(Card)`
  background: white;
  color: ${colors.primary};
  max-width: 500px;
  position: relative;
  animation: slideIn 0.3s ease-out;
  padding: 2rem;

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
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: ${colors.primary};
  text-align: center;
`;

const PopupText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: ${colors.primary};
  line-height: 1.6;
  text-align: center;
`;

const ShareInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid ${colors.primary};
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: ${colors.primary};
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

const ChallengeButton = styled(Button)`
  margin: 2rem auto 0;
  display: block;
  background: ${colors.secondary};
  
  &:hover {
    background: ${colors.accent};
  }
`;

const Game = () => {
  const { showToast } = useToast();
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { user, updateScore } = useContext(UserContext);
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const firstOptionRef = useRef(null);
  const optionsContainerRef = useRef(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [challengeUrl, setChallengeUrl] = useState('');
  const shareInputRef = useRef(null);

  const fetchQuestion = async () => {
    setLoading(true);
    setError('');
    setQuestion(null);
    setSelectedOption(null);
    setResult(null);
    setShowConfetti(false);
    
    try {
      const data = await getQuestion();
      setQuestion(data);
    } catch (err) {
      setError('Failed to load question. Please try again.');
      showToast('Failed to load question. Please try again.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChallengeClick = () => {
    if (!user) {
      showToast('Please login to challenge friends', 'info');
      navigate('/');
      return;
    }
    
    // Create share URL
    const url = `${window.location.origin}/challenge/${user.username}`;
    setChallengeUrl(url);
    setShowSharePopup(true);
    
    // Focus the input after popup appears
    setTimeout(() => {
      if (shareInputRef.current) {
        shareInputRef.current.select();
      }
    }, 100);
  };
  
  const copyToClipboard = () => {
    if (shareInputRef.current) {
      shareInputRef.current.select();
      document.execCommand('copy');
      showToast('Challenge link copied to clipboard! Share it with your friends.', 'success');
    }
  };
  
  const handleShareViaWebShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Challenge from Globetrotter',
        text: `I've challenged you to beat my score of ${user.score} points in Globetrotter!`,
        url: challengeUrl,
      })
      .then(() => {
        showToast('Challenge shared!', 'success');
        setShowSharePopup(false);
      })
      .catch(err => console.error('Error sharing:', err));
    }
  };

  const handleOptionSelect = async (option) => {
    if (selectedOption || loading) return;
    
    setSelectedOption(option);
    setLoading(true);
    
    try {
      const data = await submitAnswer(
        option.city,
        question.correct_answer,
        user?.username
      );
      
      setResult({
        correct: data.correct,
        funFact: data.fun_fact
      });
      
      if (data.correct) {
        setShowConfetti(true);
        if (user) {
          updateScore(true);
          showToast('Correct! Well done! 🎉', 'success');
        }
      } else {
        if (user) {
          updateScore(false);
          showToast('Not quite right. Try another one! 💪', 'info');
        }
      }
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      showToast('Failed to submit answer. Please try again.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <Header>
        <Logo onClick={() => navigate('/')}>
          <span className="globe-icon">🌍</span> Globetrotter
        </Logo>
        {user && (
          <UserInfo>
            <Score>
              Score: {user.score} | {user.correct_answers}/{user.total_answers}
            </Score>
            <Button secondary onClick={() => navigate('/')}>
              {user.username}
            </Button>
          </UserInfo>
        )}
      </Header>
      
      {loading && !question ? (
        <LoadingSpinner text="Preparing your next destination..." />
      ) : error ? (
        <Card>
          <FeedbackText>{error}</FeedbackText>
          <Button onClick={fetchQuestion}>Try Again</Button>
        </Card>
      ) : question && (
        <Card>
          <ClueContainer>
            <ClueTitle>Where am I?</ClueTitle>
            {question.clues.map((clue, index) => (
              <Clue key={index}>{clue}</Clue>
            ))}
          </ClueContainer>
          
          <OptionsContainer 
            ref={optionsContainerRef}
            role="group" 
            aria-label="Available destinations"
            onKeyDown={(e) => {
              if (selectedOption) return;
              
              const optionsCount = question.options.length;
              let newIndex = -1;

              switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                  e.preventDefault();
                  newIndex = (focusedIndex + 1) % optionsCount;
                  break;
                case 'ArrowLeft':
                case 'ArrowUp':
                  e.preventDefault();
                  newIndex = (focusedIndex - 1 + optionsCount) % optionsCount;
                  break;
                case 'Home':
                  e.preventDefault();
                  newIndex = 0;
                  break;
                case 'End':
                  e.preventDefault();
                  newIndex = optionsCount - 1;
                  break;
                default:
                  return;
              }

              if (newIndex !== -1) {
                const buttons = e.currentTarget.getElementsByTagName('button');
                buttons[newIndex]?.focus();
                setFocusedIndex(newIndex);
              }
            }}
          >
            {question.options.map((option, index) => (
              <OptionButton
                key={index}
                onClick={() => handleOptionSelect(option)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleOptionSelect(option);
                  }
                }}
                selected={selectedOption?.city === option.city}
                correct={option.city === question.correct_answer}
                result={result ? (selectedOption?.city === option.city ? (result.correct ? 'correct' : 'incorrect') : '') : ''}
                disabled={!!selectedOption}
                tabIndex={!selectedOption ? 0 : -1}
                role="button"
                aria-pressed={selectedOption?.city === option.city}
                aria-disabled={!!selectedOption}
                aria-label={`Select ${option.city}, ${option.country}`}
              >
                <OptionCity>{option.city}</OptionCity>
                <OptionCountry>{option.country}</OptionCountry>
              </OptionButton>
            ))}
          </OptionsContainer>
          
          {result && (
            <FeedbackContainer correct={result.correct}>
              <FeedbackTitle correct={result.correct}>
                {result.correct ? '🎉 Correct!' : '😢 Incorrect!'}
              </FeedbackTitle>
              <FeedbackText>{result.funFact}</FeedbackText>
              <ButtonGroup>
                <Button 
                  onClick={fetchQuestion}
                >
                  Next Destination
                </Button>
              </ButtonGroup>
            </FeedbackContainer>
          )}
          
          {user && (
            <ChallengeButton onClick={handleChallengeClick}>
              Challenge a Friend
            </ChallengeButton>
          )}
        </Card>
      )}
      
      {showSharePopup && (
        <Overlay
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-popup-title"
        >
          <SharePopup>
            <CloseButton 
              onClick={() => setShowSharePopup(false)}
              aria-label="Close share popup"
            >
              &times;
            </CloseButton>
            <PopupTitle id="share-popup-title">
              Challenge Your Friends! 🏆
            </PopupTitle>
            <PopupText>
              Share this link with your friends to challenge them to beat your score of {user?.score || 0} points!
            </PopupText>
            
            <ShareInput
              ref={shareInputRef}
              type="text"
              value={challengeUrl}
              readOnly
              aria-label="Challenge URL"
            />
            
            <ButtonGroup>
              <Button onClick={copyToClipboard}>
                Copy Link
              </Button>
              {navigator.share && (
                <Button secondary onClick={handleShareViaWebShare}>
                  Share...
                </Button>
              )}
            </ButtonGroup>
          </SharePopup>
        </Overlay>
      )}
    </Container>
  );
};

export default Game;
