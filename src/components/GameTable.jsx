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
    width: '98vw',
    height: 'min(70vw, 60vh)',
    margin: '4vw auto',
    maxWidth: '100vw',
    maxHeight: '60vh',
  },
  '@media (orientation: landscape) and (max-width: 900px)': {
    width: '98vw',
    height: '60vw',
    maxHeight: '70vh',
    margin: '2vw auto',
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

const GameInfo = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '16px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  padding: '8px 16px',
  borderRadius: '8px',
  color: 'white',
}));

const PotInfo = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: '#fff',
  fontSize: '1.1rem',
  letterSpacing: '0.02em',
  textShadow: '0 1px 4px rgba(0,0,0,0.18)',
  fontFamily: 'Inter, Roboto, Arial, sans-serif',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  }
}));

const CurrentBetInfo = styled(Typography)(({ theme }) => ({
  color: '#fff',
}));

const BettingRoundInfo = styled(Typography)(({ theme }) => ({
  textTransform: 'capitalize',
  color: '#fff',
}));

const MinRaiseInfo = styled(Typography)(({ theme }) => ({
  color: '#fff',
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

const GameTable = ({ gameId, isHost, onBettingRoundChange, onGameInProgressChange }) => {
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

  useEffect(() => {
    if (onBettingRoundChange && typeof onBettingRoundChange === 'function') {
      onBettingRoundChange(gameState.bettingRound);
    }
    if (onGameInProgressChange && typeof onGameInProgressChange === 'function') {
      // Hand is in progress if bettingRound is not 'showdown' and at least two players have cards
      const playersWithCards = (gameState.players || []).filter(p => p.hand && p.hand.length > 0 && !p.folded);
      const inProgress = gameState.bettingRound && gameState.bettingRound !== 'showdown' && playersWithCards.length >= 2;
      onGameInProgressChange(inProgress);
    }
  }, [gameState.bettingRound, gameState.players, onBettingRoundChange, onGameInProgressChange]);

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

  const renderPlayer = (player, position) => {
    const isCurrentPlayer = player.id === playerId;
    const isActive = player.id === gameState.currentPlayer;
    const isDealer = player.isDealer;
    const isSmallBlind = player.isSmallBlind;
    const isBigBlind = player.isBigBlind;

    return (
      <PlayerContainer
        key={player.id}
        position={position}
        isCurrentPlayer={isCurrentPlayer}
        isActive={isActive}
      >
        <PlayerInfo>
          <PlayerName>{player.username || player.name}</PlayerName>
          <ChipsInfo>Chips: {player.chips}</ChipsInfo>
          {player.currentBet > 0 && (
            <BetInfo>Bet: {player.currentBet}</BetInfo>
          )}
          {player.folded && <FoldIndicator>Folded</FoldIndicator>}
        </PlayerInfo>
        
        <PlayerHand
          cards={player.hand}
          isCurrentPlayer={isCurrentPlayer}
          isActive={isActive}
          chips={player.chips}
          currentBet={player.currentBet}
          onAction={handlePlayerAction}
        />

        <PositionIndicators>
          {isDealer && <DealerButton>D</DealerButton>}
          {isSmallBlind && <BlindIndicator>SB</BlindIndicator>}
          {isBigBlind && <BlindIndicator>BB</BlindIndicator>}
        </PositionIndicators>
      </PlayerContainer>
    );
  };

  return (
    <Box sx={{ 
      width: '100vw', 
      minHeight: 'calc(100vh - 120px)', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#181a1b',
      padding: isMobile ? '2vw' : '20px',
      overflow: 'auto',
      boxSizing: 'border-box',
      '@media (orientation: landscape) and (max-width: 900px)': {
        minHeight: '100vh',
        padding: '1vw',
      }
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
        <GameInfo>
          <PotInfo>Pot: {displayState.pot}</PotInfo>
          {displayState.currentBet > 0 && (
            <CurrentBetInfo>Current Bet: {displayState.currentBet}</CurrentBetInfo>
          )}
          <BettingRoundInfo>Round: {displayState.bettingRound}</BettingRoundInfo>
          {displayState.minRaise > 0 && (
            <MinRaiseInfo>Min Raise: {displayState.minRaise}</MinRaiseInfo>
          )}
        </GameInfo>
        <CommunityCards sx={isShowdown ? { opacity: 0.5, filter: 'grayscale(0.7)' } : {}}>
          {board.map((card, index) => {
            const parsed = parseCard(card);
            return <Card key={index} value={parsed.value} suit={parsed.suit} size={isMobile ? 'small' : 'medium'} />;
          })}
        </CommunityCards>
        <PlayersContainer>
          {orderedPlayers.map((player, index) => {
            const position = playerPositions[index % playerPositions.length];
            return renderPlayer(player, position);
          })}
        </PlayersContainer>
      </TableContainer>
    </Box>
  );
};

// Add new styled components
const PositionIndicators = styled(Box)(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  gap: '4px',
  top: '-20px',
  left: '50%',
  transform: 'translateX(-50%)',
}));

const DealerButton = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  color: '#000',
  border: '2px solid #000',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '12px',
}));

const BlindIndicator = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffd700',
  color: '#000',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold',
}));

const PlayerContainer = styled(Box)(({ theme, isCurrentPlayer, isActive }) => ({
  position: 'absolute',
  left: ({ position }) => position?.left,
  top: ({ position }) => position?.top,
  width: ({ position }) => position?.width || 'auto',
  height: ({ position }) => position?.height || 'auto',
  padding: '8px',
  background: isCurrentPlayer ? 'rgba(231,111,81,0.18)' : isActive ? 'rgba(233,196,106,0.18)' : 'rgba(30,41,59,0.85)',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: isCurrentPlayer ? '#e76f51' : isActive ? '#e9c46a' : '#fff',
  fontFamily: 'Inter, Roboto, Arial, sans-serif',
  fontWeight: isCurrentPlayer ? 700 : isActive ? 500 : 500,
  fontSize: isCurrentPlayer ? '1.1rem' : isActive ? '0.9rem' : '0.9rem',
  boxShadow: isCurrentPlayer ? '0 0 24px 6px #e76f51' : isActive ? '0 4px 16px rgba(233,196,106,0.12)' : '0 2px 8px rgba(0,0,0,0.10)',
  border: isCurrentPlayer ? '3px solid #e76f51' : isActive ? '2.5px solid #e9c46a' : '1.5px solid #2a9d8f',
  transition: 'background 0.2s',
  boxSizing: 'border-box',
  wordBreak: 'break-word',
}));

const PlayerInfo = styled(Box)(({ theme }) => ({
  marginBottom: '8px',
}));

const PlayerName = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: '#fff',
}));

const ChipsInfo = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: '#e9c46a',
}));

const BetInfo = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: '#e76f51',
}));

const FoldIndicator = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: '#e76f51',
}));

const PlayersContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const WinnerMessage = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background: #fff;
  color: #222;
  px: 4;
  py: 2;
  border-radius: 2;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  font-weight: 700;
  font-size: 2rem;
  max-width: 90vw;
  text-align: center;
  word-break: break-word;
`;

export default GameTable; 