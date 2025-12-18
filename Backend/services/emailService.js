import nodemailer from "nodemailer";

const SENDGRID_FROM = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;

// Create transporter up front; only reads env vars so it works in serverless too
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: "apikey", // This is literally the string 'apikey'
    pass: process.env.SENDGRID_API_KEY,
  },
});

const ensureEmailConfig = () => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("Missing SENDGRID_API_KEY environment variable");
  }
  if (!SENDGRID_FROM) {
    throw new Error(
      "Missing SENDGRID_FROM_EMAIL (or EMAIL_USER) environment variable"
    );
  }
};

const sendMail = async (options) => {
  ensureEmailConfig();
  const mailOptions = { ...options, from: `Reddit Clone <${SENDGRID_FROM}>` };
  await transporter.sendMail(mailOptions);
};

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationEmail = async (email, code) => {
  try {
    await sendMail({
      to: email,
      subject: "Verify Your Reddit Account",
      html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Welcome to Reddit Clone!</h2>
                <p>Thank you for registering. Please use the following code to verify your email address:</p>
                <h1 style="background-color: #ff4500; color: white; padding: 10px; display: inline-block; border-radius: 5px;">${code}</h1>
                <p>This code is valid for 10 minutes. If you did not register for this account, you can ignore this email.</p>
                <p>The Reddit Team</p>
            </div>
        `,
    });
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error);
    throw new Error("Failed to send verification email.");
  }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    await sendMail({
      to: email,
      subject: "Password Reset Request",
      html: `
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <p><a href="${resetUrl}">Reset Password</a></p>
            <p>This link is valid for 1 hour.</p>
        `,
    });
    console.log(`Reset Password email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending Reset Password email to ${email}:`, error);
    throw new Error("Failed to send Reset Password email.");
  }
};
