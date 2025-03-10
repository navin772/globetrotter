import { keyframes, css } from 'styled-components';

// Define keyframes
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideInRight = keyframes`
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideInLeft = keyframes`
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideInUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

export const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

export const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// Changed to use css helper function for mixins
export const animationMixins = {
  fadeIn: css`
    animation: ${fadeIn} 0.5s ease-out;
  `,
  slideIn: css`
    animation: ${slideIn} 0.5s ease-out;
  `,
  slideInRight: css`
    animation: ${slideInRight} 0.5s ease-out;
  `,
  slideInLeft: css`
    animation: ${slideInLeft} 0.5s ease-out;
  `,
  slideInUp: css`
    animation: ${slideInUp} 0.5s ease-out;
  `,
  pulse: css`
    animation: ${pulse} 1.5s infinite;
  `,
  bounce: css`
    animation: ${bounce} 2s infinite;
  `,
  rotate: css`
    animation: ${rotate} 2s linear infinite;
  `,
  shimmer: css`
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
    background-size: 1000px 100%;
    animation: ${shimmer} 2s infinite linear;
  `
};

// Add common transitions
export const transitions = {
  default: 'all 0.3s ease',
  fast: 'all 0.15s ease',
  slow: 'all 0.6s ease',
  bounce: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
