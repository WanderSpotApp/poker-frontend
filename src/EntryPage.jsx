import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';

const EntryPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    console.log('Current API URL:', API_BASE_URL); // Debug log

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            console.log('Attempting to register with URL:', `${API_BASE_URL}/auth/register`); // Debug log
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include' // Add this line
            });
            
            console.log('Response status:', response.status); // Debug log
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Registration failed:', errorData); // Debug log
                throw new Error(errorData.message || 'Registration failed');
            }
            
            const data = await response.json();
            console.log('Registration successful:', data); // Debug log
            navigate('/login');
        } catch (error) {
            console.error('Error during register:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            }); // Debug log
            setError(error.message || 'Failed to register. Please try again.');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={onSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default EntryPage; 