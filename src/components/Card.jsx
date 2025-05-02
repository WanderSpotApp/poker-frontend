import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const CardContainer = styled(Box)(({ theme, size }) => ({
  width: size === 'small' ? 'min(40px, 8vw)' : 'min(60px, 12vw)',
  height: size === 'small' ? 'min(56px, 11vw)' : 'min(84px, 16vw)',
  background: '#fff',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: size === 'small' ? '4px' : '6px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  border: '1px solid #ddd',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  [theme.breakpoints.down('sm')]: {
    width: size === 'small' ? 'min(32px, 10vw)' : 'min(48px, 15vw)',
    height: size === 'small' ? 'min(45px, 14vw)' : 'min(67px, 21vw)',
    padding: size === 'small' ? '3px' : '4px',
  }
}));

const CardValue = styled(Box)(({ theme, color, size }) => ({
  fontSize: size === 'small' ? '0.8rem' : '1.2rem',
  fontWeight: 700,
  color: color,
  lineHeight: 1,
  [theme.breakpoints.down('sm')]: {
    fontSize: size === 'small' ? '0.7rem' : '1rem',
  }
}));

const CardSuit = styled(Box)(({ theme, size, color }) => ({
  fontSize: size === 'small' ? '1.2rem' : '1.8rem',
  lineHeight: 1,
  textAlign: 'center',
  color: color,
  [theme.breakpoints.down('sm')]: {
    fontSize: size === 'small' ? '1rem' : '1.4rem',
  }
}));

const Card = ({ value, suit, size = 'medium' }) => {
  const getSuitSymbol = (suit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  const getColor = (suit) => {
    return suit === 'hearts' || suit === 'diamonds' ? '#e74c3c' : '#2c3e50';
  };

  return (
    <CardContainer size={size}>
      <CardValue color={getColor(suit)} size={size}>{value}</CardValue>
      <CardSuit size={size} color={getColor(suit)}>{getSuitSymbol(suit)}</CardSuit>
    </CardContainer>
  );
};

export default Card; 