// File: Frontend/pages/ResetPasswordPage.jsx

import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Get parameters from the URL: /resetPassword?token=...&email=...
    const token = searchParams.get('token');
    const email = searchParams.get('email'); 
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setLoading(false);
            return setError('Passwords do not match.');
        }

        try {
            await axios.patch(`https://reddit-t5xs.onrender.com/api/auth/resetPassword/${token}`, { 
                email,
                password // Send the new password to the backend
            });
            setSuccess(true);
            
            // Redirect to login after a delay
            setTimeout(() => navigate('/login'), 3000); 

        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed. Link may be expired or invalid.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-modal-container">
                <h2 className="modal-title">Success!</h2>
                <p className="modal-description">Your password has been reset. Redirecting to login...</p>
            </div>
        );
    }

    if (!token || !email) {
        return <div className="auth-error-view">Invalid or incomplete reset link.</div>;
    }

    return (
        <div className="auth-modal-container">
            <div className="auth-modal-box"> {/* Inner Box for centering content */}
                <h2 className="modal-title">Reset your password</h2>
                {error && <div className="auth-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="New password *"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Confirm new password *"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <p className="modal-note">Resetting your password will log you out on all devices.</p>
                    
                    <button type="submit" disabled={loading} className="full-width-button">
                        {loading ? 'Resetting...' : 'Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}