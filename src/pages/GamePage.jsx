import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GameTable from '../components/GameTable';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const hostGameId = localStorage.getItem('hostGameId');
  const isHost = hostGameId === gameId;
  const [socket, setSocket] = React.useState(null);
  const [bettingRound, setBettingRound] = React.useState();
  const [gameInProgress, setGameInProgress] = React.useState(false);

  // Debug logs
  console.log('Game ID:', gameId);
  console.log('Host Game ID:', hostGameId);
  console.log('Is Host:', isHost);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(gameId);
  };

  const handleNewHand = () => {
    if (!socket || !gameId) return;
    socket.emit('newHand', { gameId });
  };

  useEffect(() => {
    // Listen for newHand event from host tools
    const handleNewHandEvent = () => {
      if (!socket || !gameId) return;
      socket.emit('newHand', { gameId });
    };
    window.addEventListener('newHand', handleNewHandEvent);

    return () => {
      window.removeEventListener('newHand', handleNewHandEvent);
    };
  }, [socket, gameId]);

  return (
    <Box sx={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6">Game ID: {gameId}</Typography>
        <Tooltip title="Copy Game ID">
          <IconButton onClick={handleCopy} color="primary">
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
        {isHost && (
          <Button
            variant="contained"
            color="primary"
            sx={{ fontWeight: 700, fontSize: '1rem', ml: 2 }}
            onClick={handleNewHand}
            disabled={bettingRound !== 'showdown'}
          >
            Deal New Hand
          </Button>
        )}
        <Button variant="outlined" color="secondary" onClick={() => navigate('/')}>Back to Home</Button>
      </Paper>
      <GameTable
        gameId={gameId}
        isHost={isHost}
        onBettingRoundChange={setBettingRound}
        onGameInProgressChange={setGameInProgress}
      />
    </Box>
  );
};

export default GamePage; 