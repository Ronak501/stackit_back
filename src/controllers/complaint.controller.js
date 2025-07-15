import Complaint from '../models/complaint.model.js';
import Motel from '../models/motel.model.js';
import Room from '../models/room.model.js';
import mongoose from 'mongoose';

// Get all complaints
export const getComplaints = async (req, res) => {
  try {
    const { status, startDate, endDate, motelId } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    if (motelId) {
      query.motel = motelId;
    }
    
    const complaints = await Complaint.find(query)
      .populate('motel', 'name')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving complaints',
      error: error.message
    });
  }
};

// Get complaint by ID
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('motel', 'name address contactNumber email');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Get complaint by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving complaint',
      error: error.message
    });
  }
};

// Create complaint
export const createComplaint = async (req, res) => {
  try {
    const { motelId, description, roomId, user, customerName } = req.body;
    
    // Validate motel exists
    const motel = await Motel.findById(motelId);
    if (!motel) {
      return res.status(404).json({
        success: false,
        message: 'Motel not found'
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Create new complaint
    const complaint = new Complaint({
      motel: motelId,
      number: room.number,
      customer: customerName,
      user: user,
      description,
      date: new Date(),
      status: 'New'
    });
    
    await complaint.save();
    
    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating complaint',
      error: error.message
    });
  }
};

// Update complaint
export const updateComplaint = async (req, res) => {
  try {
    const { description, status } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Update fields
    if (description) complaint.description = description;
    if (status) complaint.status = status;
    
    await complaint.save();
    
    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message
    });
  }
};

// Delete complaint
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    await complaint.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint',
      error: error.message
    });
  }
};

// Get complaints by motel
export const getComplaintsByMotel = async (req, res) => {
  try {
    const { motelId } = req.params;
    const { status, startDate, endDate } = req.query;
    
    let query = { motel: motelId };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    const complaints = await Complaint.find(query).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Get complaints by motel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving complaints',
      error: error.message
    });
  }
};

// Resolve complaint
export const resolveComplaint = async (req, res) => {
  try {
    const { resolution } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    complaint.status = 'Resolved';
    complaint.resolution = resolution;
    
    await complaint.save();
    
    res.status(200).json({
      success: true,
      message: 'Complaint resolved successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Resolve complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving complaint',
      error: error.message
    });
  }
};
