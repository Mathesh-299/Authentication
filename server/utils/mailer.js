const nodeMailer = require('nodemailer');

const transporter = nodeMailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = (toEmail, otpValue) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Email Verification',
        html: `<h1 style="color:blue">Email Verification</h1>
        <p>Please verify your email by these OTP Value:</p>
        <h2 style="color:red">${otpValue}</h2>
        <p>This OTP is valid for 10 minutes.</p>
        `
    };

    return transporter.sendMail(mailOptions);
};

const sendResetPasswordEmail = (toEmail, verificationToken) => {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${verificationToken}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Password Reset',
        html: `<h1>Reset Password</h1>
        <p>We received a request to reset your password. Click the link below to set a new password. This link is valid for a limited time.</p>
        <p><a href="${resetLink}">Reset your password</a></p>
        <p>If you didn't request this, please ignore this email.</p>`
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendVerificationEmail, sendResetPasswordEmail
};