import Incident from '../models/incident.model.js';
import Room from '../models/room.model.js';
import Motel from '../models/motel.model.js';
import mongoose from 'mongoose';

// Get all incidents
export const getIncidents = async (req, res) => {
  try {
    const { type, status, startDate, endDate, motelId } = req.query;
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    // If motelId is provided, find rooms in that motel first
    if (motelId) {
      const rooms = await Room.find({ motel: motelId }).select('_id');
      const roomIds = rooms.map(room => room._id);
      query.room = { $in: roomIds };
    }
    
    const incidents = await Incident.find(query)
      .populate({
        path: 'room',
        select: 'number motel',
        populate: {
          path: 'motel',
          select: 'name'
        }
      })
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving incidents',
      error: error.message
    });
  }
};

// Get incident by ID
export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate({
        path: 'room',
        select: 'number motel dnr',
        populate: {
          path: 'motel',
          select: 'name address'
        }
      });
    
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Get incident by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving incident',
      error: error.message
    });
  }
};

// Create incident
export const createIncident = async (req, res) => {
  try {
    const { roomId, type, description, date, status, user } = req.body;
    
    // Validate room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Create incident
    const incident = new Incident({
      room: roomId,
      type,
      description,
      user,
      date: date || new Date(),
      status: status || 'Open'
    });
    
    await incident.save();
    
    // Update room's dateUpdated field
    room.dateUpdated = new Date();
    await room.save();
    
    res.status(201).json({
      success: true,
      message: 'Incident created successfully',
      data: incident
    });
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating incident',
      error: error.message
    });
  }
};

// Update incident
export const updateIncident = async (req, res) => {
  try {
    const { type, description, date, status } = req.body;
    
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }
    
    // Update fields if provided
    if (type) incident.type = type;
    if (description !== undefined) incident.description = description;
    if (date) incident.date = new Date(date);
    if (status) incident.status = status;
    
    await incident.save();
    
    // Update room's dateUpdated field
    const room = await Room.findById(incident.room);
    if (room) {
      room.dateUpdated = new Date();
      await room.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Incident updated successfully',
      data: incident
    });
  } catch (error) {
    console.error('Update incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating incident',
      error: error.message
    });
  }
};

// Delete incident
export const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }
    
    await incident.deleteOne();
    
    // Update room's dateUpdated field
    const room = await Room.findById(incident.room);
    if (room) {
      room.dateUpdated = new Date();
      await room.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Incident deleted successfully'
    });
  } catch (error) {
    console.error('Delete incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting incident',
      error: error.message
    });
  }
};

// Get incidents by room
export const getIncidentsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Validate room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const incidents = await Incident.find({ room: roomId })
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    console.error('Get incidents by room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving incidents',
      error: error.message
    });
  }
};

// Get incidents by type
export const getIncidentsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['Police Incident', 'Fire Incident'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incident type'
      });
    }
    
    const incidents = await Incident.find({ type })
      .populate({
        path: 'room',
        select: 'number motel',
        populate: {
          path: 'motel',
          select: 'name'
        }
      })
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    console.error('Get incidents by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving incidents',
      error: error.message
    });
  }
};
