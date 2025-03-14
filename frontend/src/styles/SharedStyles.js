import styled, { keyframes } from 'styled-components';
import { animationMixins, transitions } from './animations';

// Color palette
export const colors = {
  primary: '#1a2a6c',
  secondary: '#b21f1f',
  accent: '#fdbb2d',
  white: '#ffffff',
  black: '#000000',
  error: '#ff5252',
  success: '#4caf50',
};

// Gradients
export const gradients = {
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 51%, ${colors.accent} 100%)`,
  button: `linear-gradient(45deg, ${colors.secondary}, ${colors.accent})`,
};

// Shared container styles
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: ${gradients.background};
  color: ${colors.white};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/world-map.svg') center/cover no-repeat;
    opacity: 0.1;
    z-index: 0;
  }
`;

// Card component
export const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: ${props => props.maxWidth || '900px'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  transition: ${transitions.default};
  ${animationMixins.fadeIn}
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary});
    border-radius: 22px;
    z-index: -1;
    opacity: 0.5;
    transition: ${transitions.default};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    
    &::before {
      opacity: 0.7;
    }
  }
`;

// Badge component
export const Badge = styled.span`
  background: ${props => props.background || 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.color || colors.white};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  ${animationMixins.fadeIn}
`;

// IconButton component
export const IconButton = styled.button`
  background: none;
  border: none;
  color: ${colors.white};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: ${transitions.bounce};
  
  &:hover {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// Tooltip component
export const Tooltip = styled.div`
  position: relative;
  display: inline-block;

  &:hover::after {
    content: '${props => props.text}';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 5px;
    font-size: 0.9rem;
    white-space: nowrap;
    ${animationMixins.fadeIn}
  }
`;

// Update existing Button component
export const Button = styled.button`
  padding: 15px 30px;
  background: ${props => props.secondary ? 
    'rgba(255, 255, 255, 0.1)' : 
    gradients.button};
  color: ${colors.white};
  border: ${props => props.secondary ? 
    '1px solid rgba(255, 255, 255, 0.2)' : 
    'none'};
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: ${transitions.bounce};
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  ${props => props.animated && animationMixins.pulse}

  /* Accessibility improvements */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
  }

  &:focus:not(:focus-visible) {
    box-shadow: none;
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
  }

  /* Keyboard navigation indicator */
  &:focus-visible::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 13px;
    border: 2px solid ${colors.accent};
    animation: ${keyframes`
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    `} 1s infinite;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: linear-gradient(45deg, #cccccc, #dddddd);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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
    transition: ${transitions.default};
    opacity: 0;
  }

  &:hover::after {
    opacity: 1;
    transform: rotate(45deg) translate(50%, 50%);
  }
`;

// Removed duplicate Logo component declaration

// Button component
// Removed duplicate Button component declaration

// Input component
export const Input = styled.input`
  padding: 15px;
  margin-bottom: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.1);
  color: ${colors.white};
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: ${colors.accent};
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(253, 187, 45, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.05);
  }

  /* High contrast mode support */
  @media (forced-colors: active) {
    border-color: CanvasText;
    &:focus {
      border-color: Highlight;
    }
  }
`;

// Add keyboard-accessible tooltip
export const AccessibleTooltip = styled.div`
  position: relative;

  &[aria-label] {
    &:hover::after,
    &:focus::after {
      content: attr(aria-label);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      padding: 0.5rem 1rem;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 5px;
      font-size: 0.9rem;
      white-space: nowrap;
      z-index: 1000;
      ${animationMixins.fadeIn}
    }
  }
`;

// Add skip link for keyboard navigation
export const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: ${colors.accent};
  color: ${colors.white};
  padding: 8px;
  z-index: 100;
  transition: top 0.3s;

  &:focus {
    top: 0;
  }
`;

// Enhance Card accessibility
export const AccessibleCard = styled(Card)`
  &:focus-within {
    box-shadow: 0 0 0 3px rgba(253, 187, 45, 0.3);
  }

  /* Add keyboard focus styles for interactive cards */
  &[tabindex="0"] {
    cursor: pointer;
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(253, 187, 45, 0.3);
    }

    &:focus:not(:focus-visible) {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
  }
`;

// Header component
export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
`;

// Logo component
export const Logo = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.05);
  }
  
  /* Make the globe emoji more visible by adding spacing */
  & > span.globe-icon {
    font-size: 2rem;
    margin-right: 8px;
    display: inline-block;
  }
`;
