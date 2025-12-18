import e from 'express';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // Adding timeouts helps prevent the request from hanging indefinitely
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
});


export const generateVerificationCode = () => {
   
    return Math.floor(100000 + Math.random() * 900000).toString();
};


export const sendVerificationEmail = async (email, code) => {
    const mailOptions = {
        from: `Reddit Clone <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Reddit  Account',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Welcome to Reddit Clone!</h2>
                <p>Thank you for registering. Please use the following code to verify your email address:</p>
                <h1 style="background-color: #ff4500; color: white; padding: 10px; display: inline-block; border-radius: 5px;">${code}</h1>
                <p>This code is valid for 10 minutes. If you did not register for this account, you can ignore this email.</p>
                <p>The Reddit Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending verification email to ${email}:`, error);
        throw new Error('Failed to send verification email.');
    }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
    const mailOptions = {
        from: `Reddit Clone <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <p><a href="${resetUrl}">Reset Password</a></p>
            <p>This link is valid for 1 hour.</p>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reset Password email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending Reset Password email to ${email}:`, error);
        throw new Error('Failed to send Reset Password email.');
    }
};
