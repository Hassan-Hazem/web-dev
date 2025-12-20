// File: Frontend/pages/ForgotPasswordPage.jsx

import { useState } from 'react';
import ForgotPasswordRequest from '../components/react/ForgotPasswordRequest.jsx';
import ForgotPasswordCheckInbox from '../components/react/ForgotPasswordCheckInbox.jsx';
// You may need to adjust the path to your components folder

export default function ForgotPasswordPage() {
    // State to track the flow stage: 'request' or 'sent'
    const [stage, setStage] = useState('request');
    const [email, setEmail] = useState(''); // Store email for display in the next stage

    // If the email has been submitted, show the "Check your inbox" screen.
    if (stage === 'sent') {
        return <ForgotPasswordCheckInbox email={email} setStage={setStage} />;
    }

    // Default: Show the email submission form.
    return (
        <ForgotPasswordRequest 
            onSuccess={(submittedEmail) => {
                setEmail(submittedEmail);
                setStage('sent');
            }}
        />
    );
}