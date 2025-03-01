import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Confetti from 'react-confetti';
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

const Game = () => {
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const { user, updateScore } = useContext(UserContext);
  const navigate = useNavigate();

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

  const handleChallenge = () => {
    if (!user) {
      navigate('/');
      return;
    }
    
    // Generate challenge link
    const challengeLink = `${window.location.origin}/challenge/${user.username}`;
    
    // Create WhatsApp share link
    const message = `I challenge you to beat my score of ${user.score} in Globetrotter! Can you guess these destinations? ${challengeLink}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp share
    window.open(whatsappLink, '_blank');
  };

  return (
    <GameContainer>
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
    </GameContainer>
  );
};

export default Game;