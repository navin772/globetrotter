import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Confetti from 'react-confetti';
import html2canvas from 'html2canvas';
import { UserContext } from '../context/UserContext';
import { getQuestion, submitAnswer } from '../services/api';

const GameContainer = styled.div`
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

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const Score = styled.div`
  margin-right: 1rem;
  font-size: 1.2rem;
`;

const Button = styled.button`
  padding: 10px 15px;
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

const GameCard = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 2rem;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;
`;

const ClueContainer = styled.div`
  margin-bottom: 2rem;
`;

const ClueTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const Clue = styled.p`
  font-size: 1.2rem;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const OptionButton = styled.button`
  padding: 1rem;
  background-color: ${props => {
    if (props.selected && props.result === 'correct') return '#4caf50';
    if (props.selected && props.result === 'incorrect') return '#f44336';
    if (props.correct && props.result === 'incorrect') return '#4caf50';
    return 'rgba(255, 255, 255, 0.2)';
  }};
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: background-color 0.3s;
  text-align: left;

  &:hover {
    background-color: ${props => props.disabled ? '' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const OptionCity = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
`;

const OptionCountry = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const FeedbackContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${props => props.correct ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  border-radius: 5px;
  text-align: center;
`;

const FeedbackTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
`;

const FeedbackText = styled.p`
  font-size: 1.1rem;
`;

const ChallengeButton = styled(Button)`
  margin-top: 1rem;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  text-align: center;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Popup = styled.div`
  background-color: #fff;
  color: #333;
  border-radius: 10px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
  position: relative;
`;

const PopupTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1e5799;
`;

const PopupText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const ImageContainer = styled.div`
  margin: 1rem 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
  max-width: 100%;
  
  img {
    max-width: 100%;
    display: block;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin: 1rem 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 80px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 1rem 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  
  button {
    flex: 1;
    margin: 0 0.5rem;
    
    &:first-child {
      margin-left: 0;
    }
    
    &:last-child {
      margin-right: 0;
    }
  }
`;

const CaptureContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  background: linear-gradient(135deg, #1e5799 0%, #207cca 51%, #2989d8 100%);
  padding: 20px;
  border-radius: 10px;
  color: white;
  text-align: center;
  display: none;
`;

const CaptureTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const CaptureMessage = styled.p`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const CaptureLogo = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Game = () => {
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showChallengePopup, setShowChallengePopup] = useState(false);
  const [challengeImage, setChallengeImage] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [challengeLink, setChallengeLink] = useState('');
  const { user, updateScore } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Refs for capturing elements
  const captureRef = useRef(null);
  const gameContainerRef = useRef(null);

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

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
        }
      } else {
        if (user) {
          updateScore(false);
        }
      }
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate the challenge image
  const generateChallengeImage = async () => {
    if (!captureRef.current) return;
    
    setGeneratingImage(true);
    
    try {
      // Make the capture container visible
      captureRef.current.style.display = 'block';
      
      // Generate the image
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
        useCORS: true
      });
      
      // Convert canvas to data URL
      const imageUrl = canvas.toDataURL('image/png');
      setChallengeImage(imageUrl);
      
      // Hide the capture container again
      captureRef.current.style.display = 'none';
    } catch (err) {
      console.error('Error generating image:', err);
      // If image generation fails, we'll just use text
    } finally {
      setGeneratingImage(false);
    }
  };
  
  // Function to handle closing the challenge popup
  const handleClosePopup = () => {
    setShowChallengePopup(false);
    setChallengeImage(null);
    setCustomMessage('');
  };
  
  // Function to send the challenge via WhatsApp
  const handleSendChallenge = () => {
    // Create WhatsApp share link
    const message = customMessage || `I challenge you to beat my score of ${user.score} in Globetrotter! Can you guess these destinations? ${challengeLink}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp share
    window.open(whatsappLink, '_blank');
    
    // Close the popup
    handleClosePopup();
  };

  const handleChallenge = () => {
    if (!user) {
      navigate('/');
      return;
    }
    
    // Generate challenge link
    const link = `${window.location.origin}/challenge/${user.username}`;
    setChallengeLink(link);
    
    // Set default custom message
    setCustomMessage(`I challenge you to beat my score of ${user.score} in Globetrotter! Can you guess these destinations? ${link}`);
    
    // Generate the challenge image
    generateChallengeImage();
    
    // Show the challenge popup
    setShowChallengePopup(true);
  };

  return (
    <GameContainer ref={gameContainerRef}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <Header>
        <Logo onClick={() => navigate('/')}>🌍 Globetrotter</Logo>
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
        <LoadingText>Loading question...</LoadingText>
      ) : error ? (
        <div>
          <p>{error}</p>
          <Button onClick={fetchQuestion}>Try Again</Button>
        </div>
      ) : question && (
        <GameCard>
          <ClueContainer>
            <ClueTitle>Where am I?</ClueTitle>
            {question.clues.map((clue, index) => (
              <Clue key={index}>{clue}</Clue>
            ))}
          </ClueContainer>
          
          <OptionsContainer>
            {question.options.map((option, index) => (
              <OptionButton
                key={index}
                onClick={() => handleOptionSelect(option)}
                selected={selectedOption?.city === option.city}
                correct={option.city === question.correct_answer}
                result={result ? (selectedOption?.city === option.city ? (result.correct ? 'correct' : 'incorrect') : '') : ''}
                disabled={!!selectedOption}
              >
                <OptionCity>{option.city}</OptionCity>
                <OptionCountry>{option.country}</OptionCountry>
              </OptionButton>
            ))}
          </OptionsContainer>
          
          {result && (
            <FeedbackContainer correct={result.correct}>
              <FeedbackTitle>
                {result.correct ? '🎉 Correct!' : '😢 Incorrect!'}
              </FeedbackTitle>
              <FeedbackText>{result.funFact}</FeedbackText>
            </FeedbackContainer>
          )}
          
          {result && (
            <Button margin="1rem 0 0 0" onClick={fetchQuestion}>
              Next Destination
            </Button>
          )}
        </GameCard>
      )}
      
      {user && (
        <ChallengeButton onClick={handleChallenge}>
          Challenge a Friend
        </ChallengeButton>
      )}
      
      {/* Hidden container for capturing the challenge image */}
      <CaptureContainer ref={captureRef}>
        <CaptureLogo>🌍</CaptureLogo>
        <CaptureTitle>Globetrotter Challenge</CaptureTitle>
        <CaptureMessage>{user?.username} invites you to GlobeTrotter! Play now!</CaptureMessage>
      </CaptureContainer>
      
      {/* Challenge Popup */}
      {showChallengePopup && (
        <Overlay>
          <Popup>
            <CloseButton onClick={handleClosePopup}>&times;</CloseButton>
            <PopupTitle>Challenge a Friend</PopupTitle>
            
            {generatingImage ? (
              <LoadingText>Generating image...</LoadingText>
            ) : challengeImage ? (
              <ImageContainer>
                <img src={challengeImage} alt="Challenge" />
              </ImageContainer>
            ) : (
              <PopupText>
                Share this challenge with your friends and see if they can beat your score!
              </PopupText>
            )}
            
            <PopupText>Customize your message:</PopupText>
            <TextArea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter your custom message here..."
            />
            
            <PopupText>Challenge link:</PopupText>
            <Input
              value={challengeLink}
              readOnly
              onClick={(e) => e.target.select()}
            />
            
            <ButtonGroup>
              <Button secondary onClick={handleClosePopup}>
                Cancel
              </Button>
              <Button onClick={handleSendChallenge}>
                Send Invitation
              </Button>
            </ButtonGroup>
          </Popup>
        </Overlay>
      )}
    </GameContainer>
  );
};

export default Game;