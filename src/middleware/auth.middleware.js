import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid authentication token' 
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'User account is deactivated' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

export const isManagerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Manager or admin privileges required.' 
    });
  }
};
// Check if user has access to a specific motel
export const hasMotelAccess = async (req, res, next) => {
  try {
    // Get motelId from params, body, or query
    const motelId = req.params.motelId || req.params.id || req.body.motelId || req.query.motelId;
    
    if (!motelId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Motel ID is required' 
      });
    }
    
    // Admin has access to all motels
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user has this motel in their assigned motels
    const hasAccess = req.user.assignedMotels.some(m => m.equals(motelId));
    
    if (hasAccess) {
      next();
    } else {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have permission for this motel.' 
      });
    }
  } catch (error) {
    console.error('Motel access check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking motel access', 
      error: error.message 
    });
  }
};
