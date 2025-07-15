import Motel from '../models/motel.model.js';
import Room from '../models/room.model.js';
import Maintenance from '../models/maintenance.model.js';
import Complaint from '../models/complaint.model.js';
import Suggestion from '../models/suggestion.model.js';
import AnnualInspection from '../models/annualInspection.model.js';

// Get all motels
export const getMotels = async (req, res) => {
  try {
    const { active, name } = req.query;
    let query = {};
    
    if (active !== undefined) {
      query.active = active === 'true';
    }
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (req.user.role !== 'admin') {
      query._id = { $in: req.user.assignedMotels };
    }
    
    const motels = await Motel.find(query).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: motels.length,
      data: motels
    });
  } catch (error) {
    console.error('Get motels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving motels',
      error: error.message
    });
  }
};

// Get motel by ID
export const getMotelById = async (req, res) => {
  try {
    const motel = await Motel.findById(req.params.id);
    
    if (!motel) {
      return res.status(404).json({
        success: false,
        message: 'Motel not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: motel
    });
  } catch (error) {
    console.error('Get motel by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving motel',
      error: error.message
    });
  }
};

// Create motel
export const createMotel = async (req, res) => {
  try {
    const { name, address, contactNumber, email } = req.body;
    
    // Check if motel with the same name already exists
    const existingMotel = await Motel.findOne({ name });
    if (existingMotel) {
      return res.status(400).json({
        success: false,
        message: 'A motel with this name already exists'
      });
    }
    
    const motel = new Motel({
      name,
      address,
      contactNumber,
      email
    });
    
    await motel.save();
    
    res.status(201).json({
      success: true,
      message: 'Motel created successfully',
      data: motel
    });
  } catch (error) {
    console.error('Create motel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating motel',
      error: error.message
    });
  }
};

// Update motel
export const updateMotel = async (req, res) => {
  try {
    const { name, address, contactNumber, email, active } = req.body;
    
    const motel = await Motel.findById(req.params.id);
    if (!motel) {
      return res.status(404).json({
        success: false,
        message: 'Motel not found'
      });
    }
    
    // Check if new name is already taken by another motel
    if (name && name !== motel.name) {
      const existingMotel = await Motel.findOne({ name });
      if (existingMotel) {
        return res.status(400).json({
          success: false,
          message: 'A motel with this name already exists'
        });
      }
    }
    
    // Update fields
    if (name) motel.name = name;
    if (address !== undefined) motel.address = address;
    if (contactNumber !== undefined) motel.contactNumber = contactNumber;
    if (email !== undefined) motel.email = email;
    if (active !== undefined) motel.active = active;
    
    await motel.save();
    
    res.status(200).json({
      success: true,
      message: 'Motel updated successfully',
      data: motel
    });
  } catch (error) {
    console.error('Update motel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating motel',
      error: error.message
    });
  }
};

// Delete motel
export const deleteMotel = async (req, res) => {
  try {
    const motel = await Motel.findById(req.params.id);
    if (!motel) {
      return res.status(404).json({
        success: false,
        message: 'Motel not found'
      });
    }
    
    // Check if motel has any associated rooms
    const roomCount = await Room.countDocuments({ motel: motel._id });
    if (roomCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete motel. It has ${roomCount} associated room(s).`
      });
    }
    
    await motel.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Motel deleted successfully'
    });
  } catch (error) {
    console.error('Delete motel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting motel',
      error: error.message
    });
  }
};

// Get motel statistics
export const getMotelStats = async (req, res) => {
  try {
    const motelId = req.params.id;
    
    const motel = await Motel.findById(motelId);
    if (!motel) {
      return res.status(404).json({
        success: false,
        message: 'Motel not found'
      });
    }
    
    const roomCount = await Room.countDocuments({ motel: motelId });
    const maintenanceCount = await Maintenance.countDocuments({ motel: motelId });
    const complaintCount = await Complaint.countDocuments({ motel: motelId });
    const suggestionCount = await Suggestion.countDocuments({ motel: motelId });
    const lastInspection = await AnnualInspection.findOne({ motel: motelId }).sort({ date: -1 });
    
    const stats = {
      roomCount,
      maintenanceCount,
      complaintCount,
      suggestionCount,
      lastInspection: lastInspection ? {
        date: lastInspection.date,
        status: lastInspection.status
      } : null
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get motel stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving motel statistics',
      error: error.message
    });
  }
};
