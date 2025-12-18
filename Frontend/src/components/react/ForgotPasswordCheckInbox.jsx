// File: Frontend/components/auth/ForgotPasswordCheckInbox.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AuthModal.css';

export default function ForgotPasswordCheckInbox({ email, setStage }) {
    const RESEND_TIME_SECONDS = 30;
    const [timer, setTimer] = useState(RESEND_TIME_SECONDS);
    const [resendLoading, setResendLoading] = useState(false);

    // Countdown Timer Logic
    useEffect(() => {
        if (timer > 0) {
            const countdown = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(countdown);
        }
    }, [timer]);

    const handleResend = async () => {
        if (timer > 0) return; // Prevent resend if timer is still running
        
        setResendLoading(true);
        try {
            // Re-send the request using the stored email/identifier
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/forgotpassword`, { 
                identifier: email 
            });
            setTimer(RESEND_TIME_SECONDS); // Reset timer on success
        } catch (error) {
            // Handle resend error (usually just reset the timer and inform the user)
            console.error("Resend failed:", error);
            // Optionally set a message for the user
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <button 
                    onClick={() => setStage('request')} 
                    className="forgot-password-back-btn"
                    aria-label="Go back"
                >
                    ← Back
                </button>

                <div className="forgot-password-header">
                    <div className="forgot-password-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#0079d3" strokeWidth="1.5">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="M2 7l10 7 10-7" />
                        </svg>
                    </div>
                    <h2 className="forgot-password-title">Check your inbox</h2>
                    <p className="forgot-password-description">
                        An email with a link to reset your password was sent to <strong>{email}</strong>
                    </p>
                </div>

                <div className="forgot-password-info">
                    <p className="forgot-password-info-text">
                        If you don't see the email, check your spam folder or request a new one.
                    </p>
                </div>

                <div className="forgot-password-resend">
                    <span className="forgot-password-resend-text">Didn't receive the email?</span>
                    <button 
                        onClick={handleResend}
                        disabled={timer > 0 || resendLoading}
                        className="forgot-password-resend-btn"
                    >
                        {resendLoading ? 'Sending...' : (timer > 0 ? `Resend in ${timer}s` : 'Resend email')}
                    </button>
                </div>
            </div>
        </div>
    );
}