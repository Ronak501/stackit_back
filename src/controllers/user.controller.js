import User from '../models/user.model.js';
import Motel from '../models/motel.model.js';
import mongoose from 'mongoose';

// Get all users
export const getUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .populate('assignedMotels', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('assignedMotels', 'name address');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message
    });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role, assignedMotels } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }
    
    // Validate assigned motels if provided
    if (assignedMotels && assignedMotels.length > 0) {
      for (const motelId of assignedMotels) {
        const motel = await Motel.findById(motelId);
        if (!motel) {
          return res.status(404).json({
            success: false,
            message: `Motel with ID ${motelId} not found`
          });
        }
      }
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'staff',
      assignedMotels: assignedMotels || []
    });
    
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { username, email, firstName, lastName, role, isActive, assignedMotels } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if username or email is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }
    
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }
    
    // Validate assigned motels if provided
    if (assignedMotels && assignedMotels.length > 0) {
      for (const motelId of assignedMotels) {
        const motel = await Motel.findById(motelId);
        if (!motel) {
          return res.status(404).json({
            success: false,
            message: `Motel with ID ${motelId} not found`
          });
        }
      }
    }
    
    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (assignedMotels) user.assignedMotels = assignedMotels;
    
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Update user profile (for logged-in user)
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }
    
    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email) user.email = email;
    
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Change password (for logged-in user)
export const changePassword = async (req, res) => {
  try {
    const {  newPassword,userId } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password are required'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    // const isPasswordValid = await user.verifyPassword(currentPassword);
    // if (!isPasswordValid) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Current password is incorrect'
    //   });
    // }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// Assign motels to user
export const assignMotels = async (req, res) => {
  try {
    const { motelIds } = req.body;
    
    if (!motelIds || !Array.isArray(motelIds)) {
      return res.status(400).json({
        success: false,
        message: 'Motel IDs must be provided as an array'
      });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Validate all motel IDs
    for (const motelId of motelIds) {
      const motel = await Motel.findById(motelId);
      if (!motel) {
        return res.status(404).json({
          success: false,
          message: `Motel with ID ${motelId} not found`
        });
      }
    }
    
    const existingIds = user.assignedMotels.map((id) => id.toString());
    const newIds = motelIds.map((id) => id.toString());

    const combined = Array.from(new Set([...existingIds, ...newIds]));

    user.assignedMotels = combined;
    await user.save();
    
    // Populate the assigned motels for response
    await user.populate('assignedMotels', 'name');
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({
      success: true,
      message: 'Motels assigned successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Assign motels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning motels',
      error: error.message
    });
  }
};

export const getMotelById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch motel documents using IDs from assignedMotels
    const motels = await Motel.find({
      _id: { $in: user.assignedMotels },
    });

    res.status(200).json({
      success: true,
      data: motels,
    });
  } catch (error) {
    console.error("Get motel by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving motels",
      error: error.message,
    });
  }
};

export const removeAssignedMotel = async (req, res) => {
  try {
    const { userId, motelId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove the motel ID from the assignedMotels array
    user.assignedMotels = user.assignedMotels.filter(
      (assignedId) => assignedId.toString() !== motelId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Motel removed from user successfully",
      data: user.assignedMotels,
    });
  } catch (error) {
    console.error("Error removing motel from user:", error);
    res.status(500).json({
      success: false,
      message: "Error removing motel",
      error: error.message,
    });
  }
};
