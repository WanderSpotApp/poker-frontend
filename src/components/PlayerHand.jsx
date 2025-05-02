import React from 'react';
import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
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
  isMobile
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAction = (action) => {
    if (onAction) {
      onAction(action);
    }
  };

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
          mt: isSmallScreen ? '2px' : '4px' 
        }}>
          <ActionButton 
            variant="contained" 
            color="primary" 
            onClick={() => handleAction('fold')}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            Fold
          </ActionButton>
          <ActionButton 
            variant="contained" 
            color="secondary" 
            onClick={() => handleAction('call')}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            Call
          </ActionButton>
          <ActionButton 
            variant="contained" 
            color="success" 
            onClick={() => handleAction('raise')}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            Raise
          </ActionButton>
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