import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  useTheme, 
  useMediaQuery,
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const HomeContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  }
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  color: '#fff',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
    marginBottom: theme.spacing(2),
  }
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  color: '#e9c46a',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
  }
}));

const GameCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: 'rgba(30, 41, 59, 0.85)',
  borderRadius: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  border: '1px solid #2a9d8f',
  width: '100%',
  maxWidth: '500px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  }
}));

const InputField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#2a9d8f',
    },
    '&:hover fieldset': {
      borderColor: '#e9c46a',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#e9c46a',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#e9c46a',
  },
  '& .MuiInputBase-input': {
    color: '#fff',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    fontSize: '0.9rem',
  }
}));

const HomePage = () => {
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  const handleCreateGame = async () => {
    try {
      const username = localStorage.getItem('username');
      if (!username) {
        setError('Please log in first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/game/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: username })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create game');
      }
      
      const data = await response.json();
      localStorage.setItem('playerId', data.playerId);
      navigate(`/game/${data.gameId}`);
    } catch (err) {
      setError(err.message || 'Failed to create game. Please try again.');
      console.error('Error creating game:', err);
    }
  };

  const handleJoinGame = () => {
    if (!gameId) {
      setError('Please enter a game ID');
      return;
    }
    navigate(`/game/${gameId}`);
  };

  return (
    <HomeContainer>
      <Title>Texas Hold'em Poker</Title>
      <Subtitle>Play poker with friends in real-time</Subtitle>
      
      <GameCard>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#e9c46a', 
            marginBottom: 3,
            fontSize: isMobile ? '1.1rem' : '1.25rem'
          }}
        >
          Create a New Game
        </Typography>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={handleCreateGame}
          size={isMobile ? 'small' : 'medium'}
        >
          Create Game
        </ActionButton>
      </GameCard>

      <GameCard>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#e9c46a', 
            marginBottom: 3,
            fontSize: isMobile ? '1.1rem' : '1.25rem'
          }}
        >
          Join an Existing Game
        </Typography>
        <InputField
          fullWidth
          label="Game ID"
          variant="outlined"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          size={isMobile ? 'small' : 'medium'}
        />
        <ActionButton
          variant="contained"
          color="secondary"
          onClick={handleJoinGame}
          size={isMobile ? 'small' : 'medium'}
        >
          Join Game
        </ActionButton>
      </GameCard>

      <GameCard>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#e9c46a', 
            marginBottom: 3,
            fontSize: isMobile ? '1.1rem' : '1.25rem'
          }}
        >
          Account
        </Typography>
        <ActionButton
          variant="contained"
          color="error"
          onClick={handleLogout}
          size={isMobile ? 'small' : 'medium'}
        >
          Logout
        </ActionButton>
      </GameCard>

      {error && (
        <Typography 
          color="error" 
          sx={{ 
            marginTop: 2,
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}
        >
          {error}
        </Typography>
      )}
    </HomeContainer>
  );
};

export default HomePage; 