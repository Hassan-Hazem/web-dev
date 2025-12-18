// File: Frontend/components/auth/ForgotPasswordRequest.jsx

import React, { useState } from 'react';
import axios from 'axios';
import '../css/AuthModal.css';


export default function ForgotPasswordRequest({ onSuccess }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // NOTE: Using a single field for 'email or username' means your 
            // backend /forgotPassword must be able to handle both fields.
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/forgotpassword`, { 
                identifier: input // Using 'identifier' to represent either email or username
            });
            
            // If the request succeeds (even if the user doesn't exist, for security)
            onSuccess(input); 

        } catch (err) {
            // On hard failure (e.g., server offline), display an error.
            setError('An error occurred. Please try again later.');
            setLoading(false);
        }
    };

return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <div className="forgot-password-header">
                    <h2 className="forgot-password-title">Reset your password</h2>
                    <p className="forgot-password-description">
                        Enter your email address or username and we'll send you a link to reset your password.
                    </p>
                </div>

                {error && (
                    <div className="forgot-password-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="forgot-password-form">
                    <div className="forgot-password-input-group">
                        <label htmlFor="identifier" className="forgot-password-label">
                            Email or username
                        </label>
                        <input
                            id="identifier"
                            type="text"
                            className="forgot-password-input"
                            placeholder="Enter your email or username"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !input.trim()} 
                        className="forgot-password-submit-btn"
                    >
                        {loading ? 'Sending...' : 'Send reset link'}
                    </button>
                </form>
            </div>
        </div>
    );
}
