// File: Frontend/pages/AuthSuccess.jsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/authContext';

export default function AuthSuccess() { 
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token && loginWithToken) {
            
            loginWithToken(token).then(result => {
                if (result.success) {
                    navigate('/', { replace: true });
                } else {
                    navigate('/login', { state: { error: result.message || "Google sign-in failed." } });
                }
            });
        } else {
             navigate('/login', { state: { error: "Authentication redirect failed." } });
        }

    }, [navigate, loginWithToken]);

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Authenticating...</h2>
            <p>Please wait...</p>
        </div>
    );
} 
