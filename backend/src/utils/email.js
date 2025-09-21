const nodemailer = require('nodemailer');
const config = require('../../config/config');

// Create email transporter
const createTransporter = () => {
  if (!config.email.host || !config.email.user || !config.email.pass) {
    console.warn('Email configuration not provided. Email functionality disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    host: config.email.host,
    port: config.email.port || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });
};

// Send email
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('Email transporter not available. Email not sent.');
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"Ethiopian Tutorial App" <${config.email.user}>`,
      to,
      subject,
      text,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Ethiopian Tutorial App!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Welcome to Ethiopian Tutorial App!</h2>
      <p>Hello ${user.name},</p>
      <p>Welcome to our platform! We're excited to have you join our community of learners exploring Ethiopian culture, language, and traditions.</p>
      <p>You can now:</p>
      <ul>
        <li>Browse our collection of tutorials</li>
        <li>Track your learning progress</li>
        <li>Take quizzes to test your knowledge</li>
        <li>Connect with other learners</li>
      </ul>
      <p>Start your learning journey today!</p>
      <p>Best regards,<br>The Ethiopian Tutorial Team</p>
    </div>
  `;

  return await sendEmail(user.email, subject, html);
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const subject = 'Password Reset Request';
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The Ethiopian Tutorial Team</p>
    </div>
  `;

  return await sendEmail(user.email, subject, html);
};

// Send tutorial completion email
const sendTutorialCompletionEmail = async (user, tutorial) => {
  const subject = 'Congratulations! You completed a tutorial';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Congratulations!</h2>
      <p>Hello ${user.name},</p>
      <p>Great job! You've successfully completed the tutorial:</p>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1F2937;">${tutorial.title}</h3>
        <p style="color: #6B7280; margin-bottom: 0;">${tutorial.description}</p>
      </div>
      <p>Keep up the great work! Continue exploring our other tutorials to expand your knowledge of Ethiopian culture and traditions.</p>
      <p>Best regards,<br>The Ethiopian Tutorial Team</p>
    </div>
  `;

  return await sendEmail(user.email, subject, html);
};

// Send quiz completion email
const sendQuizCompletionEmail = async (user, quiz, score, isPassed) => {
  const subject = isPassed ? 'Quiz Completed Successfully!' : 'Quiz Attempt Completed';
  const statusColor = isPassed ? '#10B981' : '#F59E0B';
  const statusText = isPassed ? 'Passed' : 'Not Passed';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${statusColor};">Quiz ${statusText}!</h2>
      <p>Hello ${user.name},</p>
      <p>You've completed the quiz: <strong>${quiz.title}</strong></p>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="margin-top: 0; color: ${statusColor};">Score: ${score}%</h3>
        <p style="color: #6B7280; margin-bottom: 0;">Status: ${statusText}</p>
      </div>
      ${isPassed ? 
        '<p>Congratulations! You passed the quiz. Keep up the excellent work!</p>' : 
        '<p>Don\'t worry! You can retake the quiz to improve your score. Review the material and try again.</p>'
      }
      <p>Best regards,<br>The Ethiopian Tutorial Team</p>
    </div>
  `;

  return await sendEmail(user.email, subject, html);
};

// Send notification email
const sendNotificationEmail = async (user, title, message, type = 'info') => {
  const colors = {
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  };
  
  const subject = `Notification: ${title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${colors[type] || colors.info};">${title}</h2>
      <p>Hello ${user.name},</p>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #1F2937;">${message}</p>
      </div>
      <p>Best regards,<br>The Ethiopian Tutorial Team</p>
    </div>
  `;

  return await sendEmail(user.email, subject, html);
};

// Send bulk email
const sendBulkEmail = async (recipients, subject, html, text = '') => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail(recipient.email, subject, html, text);
    results.push({ recipient: recipient.email, ...result });
  }
  
  return results;
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, message: 'Email service not configured' };
    }
    
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendTutorialCompletionEmail,
  sendQuizCompletionEmail,
  sendNotificationEmail,
  sendBulkEmail,
  verifyEmailConfig
};
