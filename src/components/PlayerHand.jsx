import React, { useState } from 'react';
import { Box, Typography, Button, useTheme, useMediaQuery, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import Card from './Card';

const HandContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    gap: '4px',
  }
}));

const CardsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    gap: '4px',
  }
}));

const ChipsInfo = styled(Typography)(({ theme }) => ({
  color: '#e9c46a',
  fontWeight: 600,
  fontSize: '0.9rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
  }
}));

const BetInfo = styled(Typography)(({ theme }) => ({
  color: '#e76f51',
  fontWeight: 600,
  fontSize: '0.9rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: '60px',
  padding: '4px 8px',
  fontSize: '0.8rem',
  fontWeight: 600,
  textTransform: 'none',
  [theme.breakpoints.down('sm')]: {
    minWidth: '50px',
    padding: '2px 6px',
    fontSize: '0.7rem',
  }
}));

const PlayerHand = ({ 
  cards, 
  chips, 
  currentBet, 
  isActive, 
  folded, 
  onAction, 
  isLocalPlayer, 
  bettingRound,
  winner,
  isMobile,
  minRaise
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [showRaiseInput, setShowRaiseInput] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState('');
  const [raiseError, setRaiseError] = useState('');

  const handleAction = (action) => {
    if (action === 'raise') {
      setShowRaiseInput(true);
    } else {
      setShowRaiseInput(false);
      setRaiseAmount('');
      if (onAction) onAction(action);
    }
  };

  const handleRaiseConfirm = () => {
    const amount = parseInt(raiseAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setRaiseError('Enter a valid amount');
      return;
    }
    if (amount > chips) {
      setRaiseError('Not enough chips');
      return;
    }
    if (amount < minRaise) {
      setRaiseError(`Minimum raise is ${minRaise}`);
      return;
    }
    setRaiseError('');
    if (onAction) {
      onAction('raise', amount);
      setShowRaiseInput(false);
      setRaiseAmount('');
    }
  };

  const canCheck = currentBet === 0;
  const canCall = currentBet > 0 && chips >= currentBet;
  const canRaise = chips >= minRaise;

  return (
    <HandContainer>
      <CardsContainer>
        {cards.map((card, index) => (
          <Card 
            key={index} 
            value={card.value} 
            suit={card.suit} 
            size={isMobile ? 'small' : 'medium'}
          />
        ))}
      </CardsContainer>
      <ChipsInfo>
        Chips: {chips}
      </ChipsInfo>
      {currentBet > 0 && (
        <BetInfo>
          Bet: {currentBet}
        </BetInfo>
      )}
      {isLocalPlayer && isActive && !folded && bettingRound !== 'showdown' && (
        <Box sx={{ 
          display: 'flex', 
          gap: isSmallScreen ? '4px' : '8px', 
          mt: isSmallScreen ? '2px' : '4px',
          flexDirection: isSmallScreen ? 'column' : 'row',
          alignItems: 'center'
        }}>
          {canCheck && (
            <ActionButton 
              variant="contained" 
              color="primary" 
              onClick={() => handleAction('check')}
              size={isSmallScreen ? 'small' : 'medium'}
            >
              Check
            </ActionButton>
          )}
          {canCall && (
            <ActionButton 
              variant="contained" 
              color="secondary" 
              onClick={() => handleAction('call')}
              size={isSmallScreen ? 'small' : 'medium'}
            >
              Call {currentBet}
            </ActionButton>
          )}
          {canRaise && (
            <ActionButton 
              variant="contained" 
              color="success" 
              onClick={() => handleAction('raise')}
              size={isSmallScreen ? 'small' : 'medium'}
            >
              Raise
            </ActionButton>
          )}
          <ActionButton 
            variant="contained" 
            color="error" 
            onClick={() => handleAction('fold')}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            Fold
          </ActionButton>
          {showRaiseInput && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: isSmallScreen ? 1 : 0, flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  type="number"
                  size={isSmallScreen ? 'small' : 'medium'}
                  value={raiseAmount}
                  onChange={e => setRaiseAmount(e.target.value)}
                  placeholder={`Min: ${minRaise}`}
                  inputProps={{ min: minRaise, max: chips, style: { color: '#fff', width: 70 } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#2a9d8f' },
                      '&:hover fieldset': { borderColor: '#e9c46a' },
                      '&.Mui-focused fieldset': { borderColor: '#e9c46a' },
                    },
                    '& .MuiInputLabel-root': { color: '#e9c46a' },
                    '& .MuiInputBase-input': { color: '#fff' },
                    background: 'rgba(30,41,59,0.85)',
                    borderRadius: 1,
                  }}
                />
                <ActionButton
                  variant="contained"
                  color="success"
                  size={isSmallScreen ? 'small' : 'medium'}
                  onClick={handleRaiseConfirm}
                >
                  Confirm
                </ActionButton>
                <ActionButton
                  variant="outlined"
                  color="error"
                  size={isSmallScreen ? 'small' : 'medium'}
                  onClick={() => { setShowRaiseInput(false); setRaiseAmount(''); setRaiseError(''); }}
                >
                  Cancel
                </ActionButton>
              </Box>
              {raiseError && (
                <Typography color="error" sx={{ fontSize: isSmallScreen ? '0.8rem' : '0.95rem', mt: 0.5 }}>
                  {raiseError}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
      {folded && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#e76f51', 
            fontWeight: 600,
            fontSize: isSmallScreen ? '0.7rem' : '0.8rem'
          }}
        >
          Folded
        </Typography>
      )}
      {winner && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#FFD700', 
            fontWeight: 700,
            fontSize: isSmallScreen ? '0.7rem' : '0.8rem',
            textShadow: '0 0 4px #FFD700'
          }}
        >
          Winner!
        </Typography>
      )}
    </HandContainer>
  );
};

export default PlayerHand; 