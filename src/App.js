import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EntryPage from './pages/EntryPage';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2a9d8f',
    },
    secondary: {
      main: '#e9c46a',
    },
    background: {
      default: '#181a1b',
      paper: '#1e293b',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
});

function App() {
  const token = localStorage.getItem('token');
  console.log('Current token:', token);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/" /> : <EntryPage />} />
          <Route path="/" element={token ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/game/:gameId" element={token ? <GamePage /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
