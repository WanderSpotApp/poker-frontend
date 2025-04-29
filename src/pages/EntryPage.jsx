import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const EntryPage = () => {
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = tab === 0 ? 'login' : 'register';
    try {
      console.log('Attempting to', endpoint);
      const res = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      console.log('Response:', data);
      if (!res.ok) throw new Error(data.error || 'Error');
      if (tab === 0) {
        console.log('Login successful, setting token and username');
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        console.log('Navigating to home page');
        navigate('/');
      } else {
        setTab(0);
        setError('Registration successful! Please log in.');
      }
    } catch (err) {
      console.error('Error during', endpoint, ':', err);
      setError(err.message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
      <Paper sx={{ p: 4, minWidth: 320 }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); }} centered>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            {tab === 0 ? 'Login' : 'Register'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default EntryPage; 