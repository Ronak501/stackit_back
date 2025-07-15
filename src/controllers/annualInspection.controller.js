import AnnualInspection from '../models/annualInspection.model.js';
import Motel from '../models/motel.model.js';
import mongoose from 'mongoose';

// Get all inspections
export const getInspections = async (req, res) => {
  try {
    const { status, year } = req.query;
    let query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by year if provided
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const inspections = await AnnualInspection.find(query)
      .populate('motel', 'name address')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: inspections.length,
      data: inspections
    });
  } catch (error) {
    console.error('Get inspections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving inspections',
      error: error.message
    });
  }
};

// Get inspection by ID
export const getInspectionById = async (req, res) => {
  try {
    const inspection = await AnnualInspection.findById(req.params.id)
      .populate('motel', 'name address contactNumber email');
    
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: inspection
    });
  } catch (error) {
    console.error('Get inspection by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving inspection',
      error: error.message
    });
  }
};

// // Create inspection
// export const createInspection = async (req, res) => {
//   try {
//     const { motelId, date, findings, inspector, status, followUpRequired, followUpDate } = req.body;
    
//     // Validate motel exists
//     const motel = await Motel.findById(motelId);
//     if (!motel) {
//       return res.status(404).json({
//         success: false,
//         message: 'Motel not found'
//       });
//     }
    
//     // Check if inspection already exists for this motel in the same year
//     const inspectionDate = new Date(date);
//     const year = inspectionDate.getFullYear();
//     const startDate = new Date(`${year}-01-01`);
//     const endDate = new Date(`${year}-12-31`);
    
//     const existingInspection = await AnnualInspection.findOne({
//       motel: motelId,
//       date: { $gte: startDate, $lte: endDate },
//       status: { $ne: 'Scheduled' }
//     });
    
//     if (existingInspection && status !== 'Scheduled') {
//       return res.status(400).json({
//         success: false,
//         message: `An inspection already exists for this motel in ${year}`
//       });
//     }
    
//     // Create new inspection
//     const inspection = new AnnualInspection({
//       motel: motelId,
//       date: inspectionDate,
//       findings,
//       inspector,
//       status: status || 'Scheduled',
//       followUpRequired: followUpRequired || false,
//       followUpDate: followUpRequired ? followUpDate : undefined
//     });
    
//     await inspection.save();
    
//     res.status(201).json({
//       success: true,
//       message: 'Inspection created successfully',
//       data: inspection
//     });
//   } catch (error) {
//     console.error('Create inspection error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating inspection',
//       error: error.message
//     });
//   }
// };

// Create inspection
export const createInspection = async (req, res) => {
  try {
    const { motelId, date, type, inspector, authority, status, followUpRequired, followUpDate } = req.body;
    
    // Validate motel exists
    const motel = await Motel.findById(motelId);
    if (!motel) {
      return res.status(404).json({
        success: false,
        message: 'Motel not found'
      });
    }
    
    // Check if inspection already exists for this motel in the same year
    const inspectionDate = new Date(date);
    const year = inspectionDate.getFullYear();
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    
    // Create new inspection
    const inspection = new AnnualInspection({
      motel: motelId,
      date: inspectionDate,
      type,
      inspector,
      authority,
      status: status || 'Scheduled',
      followUpRequired: followUpRequired || false,
      followUpDate: followUpRequired ? followUpDate : undefined
    });
    
    await inspection.save();
    
    res.status(201).json({
      success: true,
      message: 'Inspection created successfully',
      data: inspection
    });
  } catch (error) {
    console.error('Create inspection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating inspection',
      error: error.message
    });
  }
};

// Update inspection
export const updateInspection = async (req, res) => {
  try {
    const { date, findings, inspector, status, followUpRequired, followUpDate } = req.body;
    
    const inspection = await AnnualInspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }
    
    // Update fields
    if (date) inspection.date = new Date(date);
    if (findings !== undefined) inspection.findings = findings;
    if (inspector) inspection.inspector = inspector;
    if (status) inspection.status = status;
    if (followUpRequired !== undefined) {
      inspection.followUpRequired = followUpRequired;
      if (!followUpRequired) {
        inspection.followUpDate = undefined;
      } else if (followUpDate) {
        inspection.followUpDate = new Date(followUpDate);
      }
    } else if (followUpDate && inspection.followUpRequired) {
      inspection.followUpDate = new Date(followUpDate);
    }
    
    await inspection.save();
    
    res.status(200).json({
      success: true,
      message: 'Inspection updated successfully',
      data: inspection
    });
  } catch (error) {
    console.error('Update inspection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inspection',
      error: error.message
    });
  }
};

// Delete inspection
export const deleteInspection = async (req, res) => {
  try {
    const inspection = await AnnualInspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }
    
    await inspection.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Inspection deleted successfully'
    });
  } catch (error) {
    console.error('Delete inspection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting inspection',
      error: error.message
    });
  }
};

// Get inspections by motel
export const getInspectionsByMotel = async (req, res) => {
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
    
    // Get inspections for this motel
    const inspections = await AnnualInspection.find({ motel: motelId })
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: inspections.length,
      data: inspections
    });
  } catch (error) {
    console.error('Get inspections by motel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving inspections',
      error: error.message
    });
  }
};

// Complete inspection
export const completeInspection = async (req, res) => {
  try {
    const { findings, status } = req.body;
    
    if (!status || !['Passed', 'Failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Passed or Failed'
      });
    }
    
    const inspection = await AnnualInspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }
    
    // Update inspection
    inspection.status = status;
    inspection.findings = findings || inspection.findings;
    
    await inspection.save();
    
    res.status(200).json({
      success: true,
      message: `Inspection marked as ${status}`,
      data: inspection
    });
  } catch (error) {
    console.error('Complete inspection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing inspection',
      error: error.message
    });
  }
};

// Schedule follow-up
export const scheduleFollowUp = async (req, res) => {
  try {
    const { followUpDate, notes } = req.body;
    
    if (!followUpDate) {
      return res.status(400).json({
        success: false,
        message: 'Follow-up date is required'
      });
    }
    
    const inspection = await AnnualInspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }
    
    // Update inspection
    inspection.followUpRequired = true;
    inspection.followUpDate = new Date(followUpDate);
    
    // Append notes to findings if provided
    if (notes) {
      inspection.findings = inspection.findings 
        ? `${inspection.findings}\n\nFollow-up notes: ${notes}` 
        : `Follow-up notes: ${notes}`;
    }
    
    await inspection.save();
    
    res.status(200).json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: inspection
    });
  } catch (error) {
    console.error('Schedule follow-up error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling follow-up',
      error: error.message
    });
  }
};
