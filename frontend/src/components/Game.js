import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Confetti from 'react-confetti';
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
  max-width: 550px;
  width: 90%;
  position: relative;
  animation: slideIn 0.3s ease-out;
  padding: 2rem;
  overflow: hidden;

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

const ShareImage = styled.img`
  max-width: 100%;
  border-radius: 10px;
  margin: 0 auto 1.5rem;
  display: block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const WhatsAppButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 8px;
  
  &:hover {
    background: #128C7E;
    transform: translateY(-2px);
  }
  
  svg {
    margin-right: 5px;
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
  const [challengeImage, setChallengeImage] = useState(null);
  const shareInputRef = useRef(null);
  const gameCardRef = useRef(null);

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
    
    // Capture the current UI using html2canvas
    const cardElement = document.querySelector('.game-card');
    console.log('Card element to capture:', cardElement); // Debug log
    
    if (cardElement) {
      showToast('Creating challenge image...', 'info');
      
      // Add a slight delay to ensure state updates are reflected in the DOM
      setTimeout(() => {
        html2canvas(cardElement, {
          backgroundColor: null,
          scale: 2, // Higher quality
          logging: true, // Enable logging for debugging
          allowTaint: true,
          useCORS: true
        }).then(canvas => {
          console.log('Canvas generated successfully');
          
          // Create a new canvas for adding text overlay
          const finalCanvas = document.createElement('canvas');
          const ctx = finalCanvas.getContext('2d');
          
          // Set canvas dimensions
          finalCanvas.width = canvas.width;
          finalCanvas.height = canvas.height;
          
          // Draw the captured image
          ctx.drawImage(canvas, 0, 0);
          
          // Add semi-transparent overlay for better text visibility
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add the original image with reduced opacity
          ctx.globalAlpha = 0.6;
          ctx.drawImage(canvas, 0, 0);
          ctx.globalAlpha = 1.0;
          
          // Significantly increase text size and improve styling
          ctx.fillStyle = 'white';
          
          // Calculate font size based on canvas width (responsive)
          const fontSize = Math.max(Math.floor(canvas.width / 15), 48); // Minimum 48px
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          ctx.textAlign = 'center';
          
          // Add strong text shadow for better visibility against any background
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          
          // Add main invitation text
          const text = `${user.username} challenges you!`;
          ctx.fillText(text, canvas.width / 2, canvas.height / 2);
          
          // Add smaller subtitle text below
          const subtitleFontSize = Math.max(Math.floor(fontSize * 0.6), 32); // Smaller but still prominent
          ctx.font = `${subtitleFontSize}px Arial, sans-serif`;
          ctx.fillText("Play Globetrotter now!", canvas.width / 2, canvas.height / 2 + fontSize);
          
          // Convert to data URL and set state
          const dataUrl = finalCanvas.toDataURL('image/png');
          console.log('Challenge image URL generated:', dataUrl.substring(0, 100) + '...');
          setChallengeImage(dataUrl);
          
          // Open popup after image is ready
          setShowSharePopup(true);
          
          // Focus the input after popup appears
          setTimeout(() => {
            if (shareInputRef.current) {
              shareInputRef.current.select();
            }
          }, 100);
        }).catch(err => {
          console.error('Error generating challenge image:', err);
          showToast('Could not create challenge image', 'error');
          setShowSharePopup(true);
        });
      }, 100); // Small delay to ensure DOM is ready
    } else {
      console.error('Game card element not found');
      showToast('Could not create challenge image', 'error');
      // Fallback if card element not found
      setShowSharePopup(true);
    }
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
  
  const handleShareViaWhatsApp = () => {
    const text = encodeURIComponent(`I've challenged you to beat my score of ${user.score} points in Globetrotter! ${challengeUrl}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
    showToast('Opening WhatsApp...', 'info');
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
        <Card className="game-card" ref={gameCardRef}>
          <FeedbackText>{error}</FeedbackText>
          <Button onClick={fetchQuestion}>Try Again</Button>
        </Card>
      ) : question && (
        <Card className="game-card" ref={gameCardRef}>
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
            
            {challengeImage && (
              <div style={{ margin: '0 -2rem 1.5rem' }}>
                <ShareImage
                  src={challengeImage}
                  alt={`${user.username}'s Globetrotter challenge`}
                  onLoad={() => console.log('Challenge image loaded successfully')}
                  onError={(e) => console.error('Image failed to load', e)}
                />
              </div>
            )}
            
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
              
              <WhatsAppButton
                onClick={handleShareViaWhatsApp}
                aria-label="Share via WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                WhatsApp
              </WhatsAppButton>
              
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
