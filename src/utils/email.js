import nodemailer from 'nodemailer';

/**
 * Send email utility function
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text email content
 * @param {string} [options.html] - Optional HTML content
 * @returns {Promise} - Resolves when email is sent
 */
export const sendEmail = async (options) => {
  try {
    // Create a transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      service: process.env.EMAIL_SERVICE || 'gmail',
      port: parseInt(process.env.EMAIL_PORT || '2525'),
      secure: false, // true for 465, false for other ports
    
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 60000,     // 60 seconds
       tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      debug: true, // Enable debug output
      logger: true // Log information in console
      // secure: process.env.EMAIL_SECURE === 'false',
      // requireTLS: true,
    });
    // Check if transporter is ready
    await transporter.verify();
    console.log('SMTP connection verified successfully');    
    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Motel Management <noreply@motelmanagement.com>',
      to: options.email,
      subject: options.subject,
      text: options.message
    };

    // Add HTML if provided
    if (options.html) {
      mailOptions.html = options.html;
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Generate password reset email
 * @param {Object} user - User object
 * @param {string} resetURL - Password reset URL
 * @returns {Object} - Email options object
 */
export const generatePasswordResetEmail = (user, resetURL) => {
  const name = user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>You requested a password reset for your Motel Management account.</p>
      <p>Please click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      <p>This link will expire in 30 minutes.</p>
      <p>Thank you,<br>Motel Management Team</p>
    </div>
  `;
  
  const text = `
    Hello ${name},
    
    You requested a password reset for your Motel Management account.
    
    Please use the following link to reset your password:
    ${resetURL}
    
    If you didn't request this, please ignore this email and your password will remain unchanged.
    This link will expire in 30 minutes.
    
    Thank you,
    Motel Management Team
  `;
  
  return {
    email: user.email,
    subject: 'Password Reset Request',
    message: text,
    html: html
  };
};

/**
 * Generate welcome email for new users
 * @param {Object} user - User object
 * @returns {Object} - Email options object
 */
export const generateWelcomeEmail = (user) => {
  const name = user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #333;">Welcome to Motel Management System</h2>
      <p>Hello ${name},</p>
      <p>Thank you for joining the Motel Management System. Your account has been created successfully.</p>
      <p>Your account details:</p>
      <ul>
        <li>Username: ${user.username}</li>
        <li>Role: ${user.role}</li>
      </ul>
      <p>You can now log in to the system and start managing motels.</p>
      <p>Thank you,<br>Motel Management Team</p>
    </div>
  `;
  
  const text = `
    Hello ${name},
    
    Thank you for joining the Motel Management System. Your account has been created successfully.
    
    Your account details:
    - Username: ${user.username}
    - Role: ${user.role}
    
    You can now log in to the system and start managing motels.
    
    Thank you,
    Motel Management Team
  `;
  
  return {
    email: user.email,
    subject: 'Welcome to Motel Management System',
    message: text,
    html: html
  };
};

/**
 * Generate notification email for incidents
 * @param {Object} incident - Incident object
 * @param {Object} room - Room object
 * @param {Object} motel - Motel object
 * @returns {Object} - Email options object
 */
export const generateIncidentNotificationEmail = (incident, room, motel) => {
  const incidentDate = new Date(incident.date).toLocaleDateString();
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #333;">New ${incident.type} Reported</h2>
      <p>A new incident has been reported:</p>
      <ul>
        <li><strong>Incident Type:</strong> ${incident.type}</li>
        <li><strong>Date:</strong> ${incidentDate}</li>
        <li><strong>Motel:</strong> ${motel.name}</li>
        <li><strong>Room:</strong> ${room.number}</li>
        <li><strong>Description:</strong> ${incident.description || 'No description provided'}</li>
      </ul>
      <p>Please take appropriate action.</p>
      <p>Thank you,<br>Motel Management System</p>
    </div>
  `;
  
  const text = `
    New ${incident.type} Reported
    
    A new incident has been reported:
    
    Incident Type: ${incident.type}
    Date: ${incidentDate}
    Motel: ${motel.name}
    Room: ${room.number}
    Description: ${incident.description || 'No description provided'}
    
    Please take appropriate action.
    
    Thank you,
    Motel Management System
  `;
  
  return {
    email: process.env.ADMIN_EMAIL || 'admin@motelmanagement.com',
    subject: `New ${incident.type} Reported - ${motel.name} Room ${room.number}`,
    message: text,
    html: html
  };
};

export default {
  sendEmail,
  generatePasswordResetEmail,
  generateWelcomeEmail,
  generateIncidentNotificationEmail
};
