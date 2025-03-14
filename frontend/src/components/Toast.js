import React, { createContext, useState, useCallback, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Create context
export const ToastContext = createContext();

const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 100%;
  width: 350px;
`;

const ToastItem = styled.div`
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${props => props.isClosing ? slideOut : slideIn} 0.3s ease forwards;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => {
    switch (props.type) {
      case 'success':
        return 'rgba(76, 175, 80, 0.9)';
      case 'error':
        return 'rgba(244, 67, 54, 0.9)';
      case 'info':
        return 'rgba(33, 150, 243, 0.9)';
      default:
        return 'rgba(33, 33, 33, 0.9)';
    }
  }};
`;

const ToastMessage = styled.p`
  margin: 0;
  font-size: 1rem;
  max-width: calc(100% - 30px);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration, isClosing: false }]);
  }, []);

  const closeToast = useCallback((id) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, isClosing: true } : toast
      )
    );
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  useEffect(() => {
    if (toasts.length > 0) {
      const { id, duration } = toasts[toasts.length - 1];
      const timer = setTimeout(() => {
        closeToast(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [toasts, closeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer role="log" aria-live="polite">
        {toasts.map(({ id, message, type, isClosing }) => (
          <ToastItem 
            key={id} 
            type={type} 
            isClosing={isClosing}
            role="alert"
          >
            <ToastMessage>{message}</ToastMessage>
            <CloseButton 
              onClick={() => closeToast(id)}
              aria-label="Close notification"
            >
              &times;
            </CloseButton>
          </ToastItem>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};
