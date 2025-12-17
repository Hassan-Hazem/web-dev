// File: Frontend/components/auth/ForgotPasswordRequest.jsx

import React, { useState } from 'react';
import axios from 'axios';


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
        <div className="auth-modal-container"> 
            <div className="auth-modal-box"> {/* Inner Box for centering content */}
                <h2 className="modal-title">Reset your password</h2>
                <p className="modal-description">Enter your email address or username and we'll send you a link to reset your password</p>
                
                {/* ... error display ... */}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Email or username *"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                    {/* ... (Need help link if desired) ... */}
                    <button type="submit" disabled={loading} className="full-width-button">
                        {loading ? 'Sending...' : 'Reset password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
