import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './components/Toast';
import Home from './components/Home';
import Game from './components/Game';
import Challenge from './components/Challenge';
import styled from 'styled-components';
import { transitions } from './styles/animations';

const AppContainer = styled.div`
  min-height: 100vh;
  position: relative;
`;

const PageTransition = styled.div`
  transition: ${transitions.default};
  
  &.page-enter {
    opacity: 0;
    transform: translateY(20px);
  }
  
  &.page-enter-active {
    opacity: 1;
    transform: translateY(0);
  }
  
  &.page-exit {
    opacity: 1;
    transform: translateY(0);
  }
  
  &.page-exit-active {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

function App() {
  return (
    <Router>
      <UserProvider>
        <ToastProvider>
          <AppContainer>
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game" element={<Game />} />
                <Route path="/challenge/:username" element={<Challenge />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PageTransition>
          </AppContainer>
        </ToastProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
