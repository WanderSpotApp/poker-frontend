import React from 'react';
import { Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const CardContainer = styled(Paper)(({ theme }) => ({
  width: '70px',
  height: '100px',
  backgroundColor: 'white',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  cursor: 'default',
  userSelect: 'none',
}));

const CardValue = styled(Typography)(({ theme, color }) => ({
  fontSize: '24px',
  fontWeight: 'bold',
  color: color,
}));

const CardSuit = styled(Typography)(({ theme, color }) => ({
  fontSize: '24px',
  marginTop: '-5px',
  color: color,
}));

const Card = ({ value, suit, faceDown = false }) => {
  const getSuitSymbol = (suit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '?';
    }
  };

  const getColor = (suit) => {
    return suit === 'hearts' || suit === 'diamonds' ? '#ff0000' : '#000000';
  };

  if (faceDown) {
    return (
      <CardContainer sx={{ backgroundColor: '#b22222' }}>
        <Typography variant="h6" sx={{ color: 'white' }}>🂠</Typography>
      </CardContainer>
    );
  }

  return (
    <CardContainer>
      <CardValue color={getColor(suit)}>{value}</CardValue>
      <CardSuit color={getColor(suit)}>{getSuitSymbol(suit)}</CardSuit>
    </CardContainer>
  );
};

export default Card; 