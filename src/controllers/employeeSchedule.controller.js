import EmployeeSchedule from '../models/employeeSchedule.model.js';
import Motel from '../models/motel.model.js';
import mongoose from 'mongoose';

// Get all schedules with optional motel filtering
export const getSchedules = async (req, res) => {
  try {
    const { motelId } = req.query;
    let query = {};
    
    // Filter by motel if provided
    if (motelId) {
      query.motel = motelId;
    } else if (req.user.role !== 'admin') {
      // If not admin, only show schedules for motels they have access to
      query.motel = { $in: req.user.assignedMotels };
    }
    
    const schedules = await EmployeeSchedule.find(query)
      .populate('motel', 'name')
      .sort({ motelId: 1, employeeName: 1 });
    
    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules',
      error: error.message
    });
  }
};

// Create a new schedule
export const createSchedule = async (req, res) => {
  try {
    const { employeeName, motelId, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;
    
    if (!motelId) {
      return res.status(400).json({
        success: false,
        message: 'Motel ID is required'
      });
    }
    
    // Validate motel exists
    const motel = await Motel.findById(motelId);
    if (!motel) {
      return res.status(404).json({
        success: false,
        message: 'Motel not found'
      });
    }
    
    // Check if employee already exists for this motel
    const existingSchedule = await EmployeeSchedule.findOne({ 
      employeeName, 
      motel: motelId 
    });
    
    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Employee schedule already exists for this motel'
      });
    }
    
    // Create new schedule
    const newSchedule = new EmployeeSchedule({
      employeeName,
      motel: motelId,
      monday: monday || '',
      tuesday: tuesday || '',
      wednesday: wednesday || '',
      thursday: thursday || '',
      friday: friday || '',
      saturday: saturday || '',
      sunday: sunday || ''
    });
    
    await newSchedule.save();
    
    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: newSchedule
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create schedule',
      error: error.message
    });
  }
};

// Update a schedule
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeName, motelId, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;
    
    // Find schedule
    const schedule = await EmployeeSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // If changing motel, validate it exists
    if (motelId && motelId !== schedule.motel.toString()) {
      const motel = await Motel.findById(motelId);
      if (!motel) {
        return res.status(404).json({
          success: false,
          message: 'Motel not found'
        });
      }
    }
    
    // If changing employee name or motel, check for duplicates
    if ((employeeName && employeeName !== schedule.employeeName) || 
        (motelId && motelId !== schedule.motel.toString())) {
      const existingSchedule = await EmployeeSchedule.findOne({ 
        employeeName: employeeName || schedule.employeeName,
        motel: motelId || schedule.motel
      });
      
      if (existingSchedule && existingSchedule._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Employee schedule already exists for this motel'
        });
      }
    }
    
    // Update fields
    const updatedSchedule = await EmployeeSchedule.findByIdAndUpdate(
      id,
      {
        employeeName: employeeName || schedule.employeeName,
        motel: motelId || schedule.motel,
        monday: monday !== undefined ? monday : schedule.monday,
        tuesday: tuesday !== undefined ? tuesday : schedule.tuesday,
        wednesday: wednesday !== undefined ? wednesday : schedule.wednesday,
        thursday: thursday !== undefined ? thursday : schedule.thursday,
        friday: friday !== undefined ? friday : schedule.friday,
        saturday: saturday !== undefined ? saturday : schedule.saturday,
        sunday: sunday !== undefined ? sunday : schedule.sunday
      },
      { new: true }
    ).populate('motel', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: updatedSchedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: error.message
    });
  }
};

// Delete a schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await EmployeeSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    await schedule.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  }
  catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule',
      error: error.message
    });
  }
};

// Get schedules by motel
export const getSchedulesByMotel = async (req, res) => {
  try {
    const { motelId } = req.params;
    
    // Validate motel exists
    const motel = await Motel.findById(motelId);
    if (!motel) {
      return res.status(404).json({
        success: false,
        message: 'Motel not found'
      });
    }
    
    // Check if user has access to this motel
    if (req.user.role !== 'admin' && !req.user.assignedMotels.includes(motelId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access schedules for this motel'
      });
    }
    
    const schedules = await EmployeeSchedule.find({ motel: motelId })
      .populate('motel', 'name')
      .sort({ employeeName: 1 });
    
    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching motel schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules for this motel',
      error: error.message
    });
  }
};
