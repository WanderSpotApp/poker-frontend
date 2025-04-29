import React from 'react';
import { CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EntryPage from './pages/EntryPage';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';

function App() {
  const token = localStorage.getItem('token');
  console.log('Current token:', token);

  return (
    <BrowserRouter>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <EntryPage />} />
        <Route path="/" element={token ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/game/:gameId" element={token ? <GamePage /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
