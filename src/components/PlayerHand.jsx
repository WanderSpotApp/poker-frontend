import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Card from './Card';

const HandContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
}));

const CardsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '10px',
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
}));

const PlayerHand = ({ 
  cards = [], 
  chips = 1000, 
  currentBet = 0,
  isActive = false,
  folded = false,
  onAction,
  isLocalPlayer = false,
  bettingRound
}) => {
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [hasActedThisTurn, setHasActedThisTurn] = useState(false);
  const [lastBettingRound, setLastBettingRound] = useState(bettingRound);

  // Reset hasActedThisTurn when it becomes our turn again or when a new round/hand starts
  useEffect(() => {
    if (isLocalPlayer && isActive) {
      setHasActedThisTurn(false);
    }
  }, [isActive, isLocalPlayer]);

  useEffect(() => {
    if (bettingRound !== lastBettingRound) {
      setHasActedThisTurn(false);
      setLastBettingRound(bettingRound);
    }
    if (currentBet === 0) {
      setHasActedThisTurn(false);
    }
  }, [bettingRound, currentBet, lastBettingRound]);

  const handleAction = (action, amount = 0) => {
    if (onAction && !hasActedThisTurn) {
      onAction(action, amount);
      setHasActedThisTurn(true);
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
            faceDown={!isLocalPlayer || folded}
          />
        ))}
      </CardsContainer>
      
      <Typography variant="body2" color="white">
        Chips: {chips} | Current Bet: {currentBet} {folded ? '| Folded' : ''}
      </Typography>

      {bettingRound === 'showdown' ? null : (
        <>
          {isLocalPlayer && isActive && !folded && (
            <ControlsContainer>
              <Button 
                variant="contained" 
                color="error"
                onClick={() => handleAction('fold')}
                disabled={folded}
              >
                Fold
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleAction('call')}
                disabled={folded}
              >
                Call
              </Button>
              <TextField
                type="number"
                size="small"
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                sx={{ width: '100px', backgroundColor: 'white', borderRadius: 1 }}
                disabled={folded}
              />
              <Button 
                variant="contained" 
                color="success"
                onClick={() => handleAction('raise', raiseAmount)}
                disabled={folded}
              >
                Raise
              </Button>
            </ControlsContainer>
          )}
          {isLocalPlayer && !isActive && !folded && (
            <Typography variant="body2" color="#e9c46a" sx={{ mt: 1 }}>
              Waiting for other players...
            </Typography>
          )}
        </>
      )}
    </HandContainer>
  );
};

export default PlayerHand; 