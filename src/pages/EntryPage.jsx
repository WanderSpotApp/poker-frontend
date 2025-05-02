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

const EntryContainer = styled(Container)(({ theme }) => ({
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

const FormCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'rgba(30, 41, 59, 0.85)',
  borderRadius: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  border: '1px solid #2a9d8f',
  width: '100%',
  maxWidth: '400px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
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

const EntryPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? 'login' : 'register';
      const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to authenticate');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
      console.error('Authentication error:', err);
    }
  };

  return (
    <EntryContainer>
      <Title>Texas Hold'em Poker</Title>
      <Subtitle>{isLogin ? 'Welcome back!' : 'Create your account'}</Subtitle>

      <FormCard>
        <form onSubmit={handleSubmit}>
          <InputField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size={isMobile ? 'small' : 'medium'}
          />
          <InputField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size={isMobile ? 'small' : 'medium'}
          />
          <ActionButton
            type="submit"
            variant="contained"
            color="primary"
            size={isMobile ? 'small' : 'medium'}
          >
            {isLogin ? 'Login' : 'Register'}
          </ActionButton>
        </form>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: 2,
          gap: 1
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#bfc9d1',
              fontSize: isMobile ? '0.8rem' : '0.9rem'
            }}
          >
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </Typography>
          <Button
            variant="text"
            color="secondary"
            size={isMobile ? 'small' : 'medium'}
            onClick={() => setIsLogin(!isLogin)}
            sx={{ 
              padding: 0,
              fontSize: isMobile ? '0.8rem' : '0.9rem'
            }}
          >
            {isLogin ? 'Register' : 'Login'}
          </Button>
        </Box>
      </FormCard>

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
    </EntryContainer>
  );
};

export default EntryPage; 