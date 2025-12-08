// File: Frontend/components/auth/ForgotPasswordCheckInbox.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
            await axios.post('http://localhost:5000/api/auth/forgotpassword', { 
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
        <div className="auth-modal-container">
            <div className="auth-modal-box"> {/* Inner Box for centering content */}
                <h2 className="modal-title">Check your inbox</h2>
                <p className="modal-description">
                    An email with a link to reset your password was sent to the email address associated with your account.
                </p>
                
                <div className="envelope-icon">
                    ✉️
                </div>

                <div className="resend-section">
                    Didn't get an email? 
                    <button 
                        onClick={handleResend}
                        disabled={timer > 0 || resendLoading}
                        className="resend-link"
                    >
                        {resendLoading ? 'Sending...' : (timer > 0 ? `Resend in 0:${timer.toString().padStart(2, '0')}` : 'Resend')}
                    </button>
                </div>
            </div>
        </div>
    );
}