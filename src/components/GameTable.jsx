import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import Card from './Card';
import PlayerHand from './PlayerHand';
import io from 'socket.io-client';
import { SOCKET_URL } from '../config';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const TableContainer = styled(Paper)(({ theme }) => ({
  width: 'min(95vw, 900px)',
  height: 'min(60vw, 540px)',
  background: 'linear-gradient(135deg, #264653 0%, #2a9d8f 100%)',
  borderRadius: '50% / 40%',
  position: 'relative',
  margin: '20px auto',
  padding: '0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 32px rgba(44,62,80,0.18)',
  border: '2px solid #222',
  boxSizing: 'border-box',
  [theme.breakpoints.down('sm')]: {
    height: 'min(80vw, 540px)',
    margin: '10px auto',
  }
}));

const CommunityCards = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '12px',
  margin: '0 auto 24px auto',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '8px 0',
  [theme.breakpoints.down('sm')]: {
    gap: '8px',
    margin: '0 auto 16px auto',
  }
}));

const PlayerSpot = styled(Box)(({ theme }) => ({
  position: 'absolute',
  minWidth: 'min(120px, 20vw)',
  minHeight: 'min(80px, 15vw)',
  padding: '8px 6px',
  background: 'rgba(30, 41, 59, 0.85)',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontFamily: 'Inter, Roboto, Arial, sans-serif',
  fontWeight: 500,
  fontSize: '0.9rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  border: '1.5px solid #2a9d8f',
  transition: 'background 0.2s',
  boxSizing: 'border-box',
  wordBreak: 'break-word',
  [theme.breakpoints.down('sm')]: {
    minWidth: 'min(100px, 25vw)',
    minHeight: 'min(70px, 20vw)',
    fontSize: '0.8rem',
    padding: '6px 4px',
  }
}));

const ActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '12px',
  [theme.breakpoints.down('sm')]: {
    gap: '4px',
    marginTop: '8px',
  }
}));

const PotInfo = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontSize: '1.1rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
  marginBottom: '12px',
  textShadow: '0 1px 4px rgba(0,0,0,0.18)',
  fontFamily: 'Inter, Roboto, Arial, sans-serif',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    marginBottom: '8px',
  }
}));

// Parse board cards robustly
function parseCard(card) {
  if (!card) return { value: '?', suit: undefined };
  if (typeof card === 'string') {
    // e.g. 'Ah', 'Ks', '10d'
    const value = card.length === 3 ? card.slice(0, 2) : card[0];
    const suitChar = card[card.length - 1].toLowerCase();
    let suit;
    switch (suitChar) {
      case 'h': suit = 'hearts'; break;
      case 'd': suit = 'diamonds'; break;
      case 'c': suit = 'clubs'; break;
      case 's': suit = 'spades'; break;
      default: suit = undefined;
    }
    return { value, suit };
  } else if (card && (card.value || card.rank) && card.suit) {
    // Accept both value/suit and rank/suit
    let suit = card.suit;
    if (['h', 'd', 'c', 's'].includes(suit)) {
      switch (suit) {
        case 'h': suit = 'hearts'; break;
        case 'd': suit = 'diamonds'; break;
        case 'c': suit = 'clubs'; break;
        case 's': suit = 'spades'; break;
        default: suit = undefined;
      }
    }
    return { value: card.value || card.rank, suit };
  }
  return { value: '?', suit: undefined };
}

const GameTable = ({ gameId, isHost }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    communityCards: [],
    players: [],
    currentPlayer: null,
    pot: 0,
    currentBet: 0,
    bettingRound: 'pre-flop',
  });
  const [connected, setConnected] = useState(false);
  const [playerId, setPlayerId] = useState(() => {
    // Try to load playerId from localStorage
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId) return storedPlayerId;
    
    // Create a new playerId if one doesn't exist
    const newPlayerId = `player-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('playerId', newPlayerId);
    return newPlayerId;
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (playerId) {
      localStorage.setItem('playerId', playerId);
    }
  }, [playerId]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      
      // Join the game room on connect if gameId is available
      if (gameId && playerId) {
        const username = localStorage.getItem('username');
        newSocket.emit('joinGame', { gameId, playerId, username });
      }
    });

    newSocket.on('gameState', (state) => {
      console.log('Received game state:', state);
      setGameState(state);
    });

    newSocket.on('joinedGame', ({ gameId, playerId, reconnected }) => {
      console.log('Joined game:', gameId, 'as player:', playerId);
      setPlayerId(playerId);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [gameId, playerId]);

  const handlePlayerAction = (action, amount = 0) => {
    if (!socket || !gameId || !playerId) return;
    socket.emit('playerAction', { gameId, playerId, action, amount });
  };

  const createGame = () => {
    if (!socket || !playerId) return;
    
    // Create a new game
    socket.emit('createGame', { playerId });
  };

  const joinGame = () => {
    if (!socket || !playerId || !gameId) return;
    
    // Join the game
    socket.emit('joinGame', { gameId, playerId });
  };

  const startNewHand = () => {
    if (!socket || !gameId) return;
    
    // Start a new hand
    socket.emit('newHand', { gameId });
  };

  // Example player positions
  const playerPositions = [
    { id: 1, position: 'bottom', left: '50%', bottom: '20px' },
    { id: 2, position: 'bottom-right', right: '20px', bottom: '20px' },
    { id: 3, position: 'right', right: '20px', top: '50%' },
    { id: 4, position: 'top-right', right: '20px', top: '20px' },
    { id: 5, position: 'top', left: '50%', top: '20px' },
    { id: 6, position: 'top-left', left: '20px', top: '20px' },
    { id: 7, position: 'left', left: '20px', top: '50%' },
    { id: 8, position: 'bottom-left', left: '20px', bottom: '20px' },
  ];

  // For testing: Add some sample data
  const testGameState = {
    communityCards: [
      { value: 'A', suit: 'hearts' },
      { value: 'K', suit: 'spades' },
      { value: 'Q', suit: 'diamonds' },
    ],
    players: [
      { 
        id: 'player-1', 
        position: 1, 
        cards: [
          { value: 'A', suit: 'clubs' },
          { value: 'K', suit: 'clubs' }
        ],
        chips: 1000,
        currentBet: 50,
      },
      { 
        id: 'player-2', 
        position: 3, 
        cards: [
          { value: 'J', suit: 'hearts' },
          { value: '10', suit: 'hearts' }
        ],
        chips: 950,
        currentBet: 50,
      },
    ],
    currentPlayer: 'player-1',
    pot: 100,
    currentBet: 50,
    bettingRound: 'flop',
  };

  // Use test data if not connected to server
  const displayState = connected ? gameState : testGameState;
  const board = displayState.board || displayState.communityCards || [];
  const players = displayState.players || [];

  // For debugging: log players, playerId, and currentPlayer
  console.log('players:', players, 'playerId:', playerId, 'currentPlayer:', displayState.currentPlayer);

  // Number of seats
  const numSeats = playerPositions.length;
  // Table center and radii
  const tableWidth = 900;
  const tableHeight = 540;
  const centerX = tableWidth / 2;
  const centerY = tableHeight / 2;
  const radiusX = 370;
  const radiusY = 210;

  // Reorder players so local player is always first (bottom center for this client)
  let orderedPlayers = [];
  if (players && players.length > 0) {
    const currentIdx = players.findIndex(p => p.id === playerId);
    if (currentIdx !== -1) {
      orderedPlayers = [players[currentIdx], ...players.slice(0, currentIdx), ...players.slice(currentIdx + 1)];
    } else {
      orderedPlayers = players;
    }
  }

  // Winner message (center of table)
  const winnerMessage = displayState.winner ? `🏆 Winner: ${displayState.winner.username || displayState.winner.name || displayState.winner.id}! 🏆` : null;
  const isShowdown = displayState.bettingRound === 'showdown';
  const winnerId = displayState.winner && (displayState.winner.id || displayState.winner._id);

  return (
    <Box sx={{ 
      width: '100vw', 
      minHeight: 'calc(100vh - 120px)', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#181a1b',
      padding: isMobile ? '10px' : '20px',
      overflow: 'auto'
    }}>
      <TableContainer>
        {/* Winner message */}
        {winnerMessage && (
          <Box sx={{ 
            position: 'absolute', 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 10, 
            background: '#fff', 
            color: '#222', 
            px: isMobile ? 2 : 4, 
            py: isMobile ? 1 : 2, 
            borderRadius: 2, 
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)', 
            fontWeight: 700, 
            fontSize: isMobile ? '1.2rem' : '2rem', 
            maxWidth: '90vw', 
            textAlign: 'center', 
            wordBreak: 'break-word' 
          }}>
            {winnerMessage}
          </Box>
        )}
        <PotInfo>
          Pot: {displayState.pot} | Bet: {displayState.currentBet} | {displayState.bettingRound}
        </PotInfo>
        <CommunityCards sx={isShowdown ? { opacity: 0.5, filter: 'grayscale(0.7)' } : {}}>
          {board.map((card, index) => {
            const parsed = parseCard(card);
            return <Card key={index} value={parsed.value} suit={parsed.suit} size={isMobile ? 'small' : 'medium'} />;
          })}
        </CommunityCards>
        {/* Render seats symmetrically using polar coordinates */}
        {Array.from({ length: numSeats }).map((_, idx) => {
          const angle = ((360 / numSeats) * idx + 90) % 360;
          const rad = (angle * Math.PI) / 180;
          const left = centerX + radiusX * Math.cos(rad) - (isMobile ? 40 : 60);
          const top = centerY + radiusY * Math.sin(rad) - (isMobile ? 30 : 40);
          const player = orderedPlayers[idx];
          const isLocalPlayer = player && player.id === playerId;
          const isCurrentPlayer = player && player.id === displayState.currentPlayer;
          const isWinner = isShowdown && player && player.id === winnerId;
          let cards = player && player.hand ? player.hand.map(parseCard) : [];
          if (isLocalPlayer && player.hand) {
            cards = player.hand.map(parseCard);
          }
          return (
            <PlayerSpot
              key={idx}
              sx={{
                left: `${left}px`,
                top: `${top}px`,
                border: isCurrentPlayer ? '3px solid #e76f51' : isLocalPlayer ? '2.5px solid #e9c46a' : '1.5px solid #2a9d8f',
                background: isCurrentPlayer ? 'rgba(231,111,81,0.18)' : isLocalPlayer ? 'rgba(233,196,106,0.18)' : 'rgba(30,41,59,0.85)',
                boxShadow: isCurrentPlayer ? '0 0 24px 6px #e76f51' : isLocalPlayer ? '0 4px 16px rgba(233,196,106,0.12)' : '0 2px 8px rgba(0,0,0,0.10)',
              }}
            >
              {/* Trophy for winner */}
              {isWinner && (
                <EmojiEventsIcon sx={{ 
                  fontSize: isMobile ? 40 : 60, 
                  color: '#FFD700', 
                  mb: 0.5, 
                  filter: 'drop-shadow(0 0 8px #FFD700)' 
                }} />
              )}
              {/* Order of play indicator */}
              <Typography variant="caption" sx={{ 
                color: '#bfc9d1', 
                fontWeight: 700, 
                mb: 0.5,
                fontSize: isMobile ? '0.7rem' : '0.8rem'
              }}>
                Seat {idx + 1}
              </Typography>
              {/* Player name */}
              {player && (
                <Typography variant="subtitle2" sx={{ 
                  color: isCurrentPlayer ? '#e76f51' : isLocalPlayer ? '#e9c46a' : '#fff', 
                  fontWeight: 700, 
                  mb: 0.5, 
                  fontSize: isMobile ? '0.9rem' : '1.1rem', 
                  letterSpacing: 0.5, 
                  textAlign: 'center', 
                  wordBreak: 'break-word' 
                }}>
                  {player.username || player.name || player.id}
                </Typography>
              )}
              {/* Your Turn! message */}
              {isLocalPlayer && isCurrentPlayer && !isShowdown && (
                <Typography variant="body2" sx={{ 
                  color: '#e76f51', 
                  fontWeight: 700, 
                  mb: 0.5,
                  fontSize: isMobile ? '0.7rem' : '0.8rem'
                }}>
                  Your Turn!
                </Typography>
              )}
              {player ? (
                <PlayerHand
                  cards={cards}
                  chips={player.chips}
                  currentBet={player.currentBet}
                  isActive={isCurrentPlayer}
                  folded={player.folded}
                  onAction={isLocalPlayer ? handlePlayerAction : undefined}
                  isLocalPlayer={isLocalPlayer}
                  bettingRound={displayState.bettingRound}
                  winner={isWinner}
                  isMobile={isMobile}
                />
              ) : (
                <Typography variant="body2" sx={{ 
                  color: '#bfc9d1', 
                  fontWeight: 400,
                  fontSize: isMobile ? '0.7rem' : '0.8rem'
                }}>
                  Empty Seat
                </Typography>
              )}
            </PlayerSpot>
          );
        })}
      </TableContainer>
    </Box>
  );
};

export default GameTable; 