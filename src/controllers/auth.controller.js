import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail, generatePasswordResetEmail,generateWelcomeEmail,generateIncidentNotificationEmail } from '../utils/email.js';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
  
  const refreshToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
  
  return { accessToken, refreshToken };
};

// User signup
export const signup = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password, // Will be hashed by the bcrypt plugin
      firstName,
      lastName,
      role: 'staff', // Default role
    });
    
    await newUser.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser._id);
    // try {
    //   const welcomeEmailOptions = generateWelcomeEmail(newUser);
    //   await sendEmail(welcomeEmailOptions);
    //   console.log('Welcome email sent successfully');
    //  } catch (emailError) {
    //   console.error('Welcome email failed, but signup completed:', emailError);
    //   // Don't throw the error - let signup succeed
    // }
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error registering user', 
      error: error.message 
    });
  }
};

// User login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact administrator.' 
      });
    }
    
    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error during login', 
      error: error.message 
    });
  }
};

// User logout
export const logout = async (req, res) => {
  // In a stateless JWT authentication system, the client simply discards the tokens
  // However, you could implement a token blacklist if needed
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token is required' 
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid refresh token or user is inactive' 
      });
    }
    
    // Generate new tokens
    const tokens = generateTokens(user._id);
    
    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired refresh token' 
    });
  }
};

// Forgot password
// Forgot password
export const forgotPassword = async (req, res) => {
  let user;
  try {
    const { email } = req.body;
    
    // Find user by email
    user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No user found with this email' 
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and save to user
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();
    
    // Create reset URL
    const resetURL = `${req.protocol}://motel-management-alpha.vercel.app/reset-password/${resetToken}`;
    
    // Send email
    // Generate email options using utility function
    const emailOptions = generatePasswordResetEmail(user, resetURL);
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Password Reset Request',
    //   message: `You requested a password reset. Please use the following link to reset your password: ${resetURL}. If you didn't request this, please ignore this email.`
    // });
    await sendEmail(emailOptions);
    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // If there's an error, clear reset token fields
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error sending password reset email', 
      error: error.message 
    });
  }
};


// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Hash the received token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resetting password', 
      error: error.message 
    });
  }
};
