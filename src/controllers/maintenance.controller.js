import Maintenance from '../models/maintenance.model.js';
import Motel from '../models/motel.model.js';
import mongoose from 'mongoose';

// Get all maintenance records
export const getMaintenanceRecords = async (req, res) => {
  try {
    const { status, type, startDate, endDate, motelId } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
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
    
    const maintenanceRecords = await Maintenance.find(query)
      .populate('motel', 'name')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: maintenanceRecords.length,
      data: maintenanceRecords
    });
  } catch (error) {
    console.error('Get maintenance records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving maintenance records',
      error: error.message
    });
  }
};

// Get maintenance record by ID
export const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('motel', 'name address contactNumber email');
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Get maintenance by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving maintenance record',
      error: error.message
    });
  }
};

// // Create maintenance record
// export const createMaintenance = async (req, res) => {
//   try {
//     const { motelId, type, description, status, number } = req.body;
    
//     // Validate motel exists
//     const motel = await Motel.findById(motelId);
//     if (!motel) {
//       return res.status(404).json({
//         success: false,
//         message: 'Motel not found'
//       });
//     }
    
//     // Create maintenance record
//     const maintenance = new Maintenance({
//       motel: motelId,
//       type,
//       description,
//       date: new Date(),
//       status: status || 'Pending'
//     });
    
//     await maintenance.save();
    
//     res.status(201).json({
//       success: true,
//       message: 'Maintenance record created successfully',
//       data: maintenance
//     });
//   } catch (error) {
//     console.error('Create maintenance error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating maintenance record',
//       error: error.message
//     });
//   }
// };

export const createMaintenance = async (req, res) => {
  try {
    const { motel_id, type, description, status, number, user } = req.body;
    
    // Validate motel exists
    const motel = await Motel.findById(motel_id);
    if (!motel) {
      return res.status(404).json({
        success: false,
        message: 'Motel not found'
      });
    }

    // Create maintenance record
    const maintenance = new Maintenance({
      motel: motel_id,
      type: type,
      description: description,
      date: new Date(),
      user: user,
      status: status || 'Pending',
      number: number || null,
    });
    
    await maintenance.save();
    
    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: maintenance
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating maintenance record',
      error: error.message
    });
  }
};

// Update maintenance record
export const updateMaintenance = async (req, res) => {
  try {
    const { type, description, status } = req.body;
    
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }
    
    // Update fields if provided
    if (type) maintenance.type = type;
    if (description) maintenance.description = description;
    if (status) {
      maintenance.status = status;
      
      // If status is changed to Completed, set completedDate
      if (status === 'Completed' && maintenance.status !== 'Completed') {
        maintenance.completedDate = new Date();
      } else if (status !== 'Completed') {
        maintenance.completedDate = undefined;
      }
    }
    
    await maintenance.save();
    
    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: maintenance
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating maintenance record',
      error: error.message
    });
  }
};

// Delete maintenance record
export const deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }
    
    await maintenance.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Maintenance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting maintenance record',
      error: error.message
    });
  }
};

// Get maintenance records by motel
export const getMaintenanceByMotel = async (req, res) => {
  try {
    const { motelId } = req.params;
    const { status, type, startDate, endDate } = req.query;
    
    // Validate motel exists
    const motel = await Motel.findById(motelId);
    if (!motel) {
      return res.status(404).json({
        success: false,
        message: 'Motel not found'
      });
    }
    
    let query = { motel: motelId };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    const maintenanceRecords = await Maintenance.find(query)
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: maintenanceRecords.length,
      data: maintenanceRecords
    });
  } catch (error) {
    console.error('Get maintenance by motel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving maintenance records',
      error: error.message
    });
  }
};

// Mark maintenance as completed
export const markAsCompleted = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }
    
    maintenance.status = 'Completed';
    maintenance.completedDate = new Date();
    
    await maintenance.save();
    
    res.status(200).json({
      success: true,
      message: 'Maintenance marked as completed',
      data: maintenance
    });
  } catch (error) {
    console.error('Mark as completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking maintenance as completed',
      error: error.message
    });
  }
};
