import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

const HomePage = () => {
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [joinError, setJoinError] = useState('');
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const [socket, setSocket] = useState(null);

  // Ensure a unique playerId per browser
  const [playerId, setPlayerId] = useState(() => {
    let stored = localStorage.getItem('playerId');
    if (!stored) {
      stored = `player-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('playerId', stored);
    }
    return stored;
  });

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleCreateGame = () => {
    if (!socket) return;
    socket.once('joinedGame', ({ gameId, playerId: joinedPlayerId }) => {
      localStorage.setItem('playerId', joinedPlayerId);
      localStorage.setItem('hostGameId', gameId);
      navigate(`/game/${gameId}`);
    });
    socket.emit('createGame', { playerId, username });
  };

  const handleJoinGame = () => {
    if (!joinId.trim()) {
      setJoinError('Please enter a game ID');
      return;
    }
    if (!socket) {
      setJoinError('Connection to server not established');
      return;
    }
    setJoinError('');
    socket.once('joinedGame', ({ gameId, playerId: joinedPlayerId }) => {
      localStorage.setItem('playerId', joinedPlayerId);
      navigate(`/game/${gameId}`);
    });
    socket.once('error', ({ error }) => {
      setJoinError(error);
    });
    socket.emit('joinGame', { gameId: joinId.trim(), playerId, username });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
      <Paper sx={{ p: 4, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Welcome, {username}!</Typography>
        <Button variant="contained" color="primary" fullWidth onClick={handleCreateGame} sx={{ mb: 1 }}>
          Create Game
        </Button>
        <Button variant="outlined" color="primary" fullWidth onClick={() => setJoinOpen(true)} sx={{ mb: 1 }}>
          Join Game
        </Button>
        <Button variant="text" color="secondary" fullWidth onClick={handleLogout}>
          Logout
        </Button>
      </Paper>
      <Dialog open={joinOpen} onClose={() => setJoinOpen(false)}>
        <DialogTitle>Join Game</DialogTitle>
        <DialogContent>
          <TextField
            label="Game ID"
            value={joinId}
            onChange={e => setJoinId(e.target.value)}
            fullWidth
            autoFocus
            margin="normal"
            error={!!joinError}
            helperText={joinError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinOpen(false)}>Cancel</Button>
          <Button onClick={handleJoinGame} variant="contained">Join</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage; 