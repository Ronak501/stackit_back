import LeaveApplication from '../models/leaveApplication.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// Get all leave applications with filtering options
export const getLeaveApplications = async (req, res) => {
  try {
    const { userId, status, leaveType, startDate, endDate, page = 1, limit = 20} = req.query;
    
    let query = {};
    
    // Filter by user if provided
    if (userId) {
      query.user = userId;
    } else if (req.user.role !== 'admin') {
      // If not admin, only show user's own applications or applications of users they manage
      if (req.user.role === 'manager') {
        // Get IDs of users assigned to the same motels as the manager
        const managedMotels = req.user.assignedMotels;
        const managedUsers = await User.find({ 
          assignedMotels: { $in: managedMotels },
          _id: { $ne: req.user._id }
        }).select('_id');
        
        const managedUserIds = managedUsers.map(user => user._id);
        query.$or = [
          { user: req.user._id },
          { user: { $in: managedUserIds } }
        ];
      } else {
        // Regular staff can only see their own applications
        query.user = req.user._id;
      }
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by leave type if provided
    if (leaveType) {
      query.leaveType = leaveType;
    }
    
    // Filter by date range if provided
    if (startDate && endDate) {
      query.$or = [
        // Leave starts within the range
        { 
          startDate: { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
          } 
        },
        // Leave ends within the range
        { 
          endDate: { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
          } 
        },
        // Leave spans the entire range
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(endDate) }
        }
      ];
    }
    
    // Set up pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const leaveApplications = await LeaveApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username firstName lastName email')
      .populate('approvedBy', 'username firstName lastName')
      .populate('createdBy', 'username firstName lastName');
    
    const total = await LeaveApplication.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: leaveApplications.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: leaveApplications
    });
  } catch (error) {
    console.error('Get leave applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving leave applications',
      error: error.message
    });
  }
};

// Get leave application by ID
export const getLeaveApplicationById = async (req, res) => {
  try {
    const leaveApplication = await LeaveApplication.findById(req.params.id)
      .populate('user', 'username firstName lastName email')
      .populate('approvedBy', 'username firstName lastName')
      .populate('createdBy', 'username firstName lastName');
    
    if (!leaveApplication) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }
    
    // Check if user has permission to view this application
    if (req.user.role !== 'admin' && 
        leaveApplication.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this leave application'
      });
    }
    
    // If user is manager, check if they manage the user who applied
    if (req.user.role === 'manager' && 
        leaveApplication.user._id.toString() !== req.user._id.toString()) {
      
      const applicantUser = await User.findById(leaveApplication.user._id);
      const hasCommonMotel = applicantUser.assignedMotels.some(
        motelId => req.user.assignedMotels.includes(motelId.toString())
      );
      
      if (!hasCommonMotel) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this leave application'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: leaveApplication
    });
  } catch (error) {
    console.error('Get leave application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving leave application',
      error: error.message
    });
  }
};

// Create leave application
export const createLeaveApplication = async (req, res) => {
  try {
    const { userId, startDate, endDate, workDate,leaveType, reason, motel } = req.body;
    
    // Determine which user is applying for leave
    let applicantId;
    
    // If admin or manager is creating for someone else
    if (userId && (req.user.role === 'admin' || req.user.role === 'manager')) {
      // Verify the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // If manager, verify they manage this user
      if (req.user.role === 'manager') {
        const hasCommonMotel = user.assignedMotels.some(
          motelId => req.user.assignedMotels.includes(motelId.toString())
        );
        
        if (!hasCommonMotel) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to create leave for this user'
          });
        }
      }
      
      applicantId = userId;
    } else {
      // User is applying for themselves
      applicantId = req.user._id;
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
    
    if (start < new Date() && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply for leave in the past'
      });
    }
    
    // Check for overlapping leave applications
    const overlappingLeave = await LeaveApplication.findOne({
      user: applicantId,
      status: { $ne: 'Rejected' },
      $or: [
        // New leave starts during existing leave
        {
          startDate: { $lte: start },
          endDate: { $gte: start }
        },
        // New leave ends during existing leave
        {
          startDate: { $lte: end },
          endDate: { $gte: end }
        },
        // New leave contains existing leave
        {
          startDate: { $gte: start },
          endDate: { $lte: end }
        }
      ]
    });
    
    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: 'There is already an approved or pending leave application for this period'
      });
    }
    
    // Create leave application
    const leaveApplication = new LeaveApplication({user: applicantId,startDate: start,endDate: end,workDate,motel,leaveType,reason,createdBy: req.user._id});
    
    // If admin is creating, auto-approve
    if (req.user.role === 'admin') {
      leaveApplication.status = 'Approved';
      leaveApplication.approvedBy = req.user._id;
      leaveApplication.approvalDate = new Date();
    }
    
    await leaveApplication.save();
    
    res.status(201).json({
      success: true,
      message: 'Leave application created successfully',
      data: leaveApplication
    });
  } catch (error) {
    console.error('Create leave application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating leave application',
      error: error.message
    });
  }
};

// Update leave application
export const updateLeaveApplication = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;
    
    const leaveApplication = await LeaveApplication.findById(req.params.id);
    
    if (!leaveApplication) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }
    
    // Check if user has permission to update
    if (req.user.role !== 'admin' && 
        leaveApplication.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this leave application'
      });
    }
    
    // Can only update if status is Pending
    if (leaveApplication.status !== 'Pending' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update leave application that has been approved or rejected'
      });
    }
    
    // Update fields if provided
    if (startDate) {
      const start = new Date(startDate);
      if (start < new Date() && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot set start date in the past'
        });
      }
      leaveApplication.startDate = start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      if (leaveApplication.startDate > end) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
      leaveApplication.endDate = end;
    }
    
    if (leaveType) leaveApplication.leaveType = leaveType;
    if (reason) leaveApplication.reason = reason;
    
    await leaveApplication.save();
    
    res.status(200).json({
      success: true,
      message: 'Leave application updated successfully',
      data: leaveApplication
    });
  } catch (error) {
    console.error('Update leave application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating leave application',
      error: error.message
    });
  }
};

// Delete leave application
export const deleteLeaveApplication = async (req, res) => {
  try {
    const leaveApplication = await LeaveApplication.findById(req.params.id);
    
    if (!leaveApplication) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }
    
    // Check if user has permission to delete
    if (req.user.role !== 'admin' && 
        leaveApplication.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this leave application'
      });
    }
    
    // Can only delete if status is Pending
    if (leaveApplication.status !== 'Pending' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete leave application that has been approved or rejected'
      });
    }
    
    await leaveApplication.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Leave application deleted successfully'
    });
  } catch (error) {
    console.error('Delete leave application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting leave application',
      error: error.message
    });
  }
};

// Approve leave application
export const approveLeaveApplication = async (req, res) => {
  try {
    const leaveApplication = await LeaveApplication.findById(req.params.id);
    
    if (!leaveApplication) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }
    
    // Check if user has permission to approve
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to approve leave applications'
      });
    }
    
    // If manager, check if they manage the user who applied
    if (req.user.role === 'manager') {
      const applicantUser = await User.findById(leaveApplication.user);
      const hasCommonMotel = applicantUser.assignedMotels.some(
        motelId => req.user.assignedMotels.includes(motelId.toString())
      );
      
      if (!hasCommonMotel) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to approve this leave application'
        });
      }
    }
    
    // Can only approve if status is Pending
    if (leaveApplication.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve leave application that has already been processed'
      });
    }
    
    leaveApplication.status = 'Approved';
    leaveApplication.approvedBy = req.user._id;
    leaveApplication.approvalDate = new Date();
    
    await leaveApplication.save();
    
    res.status(200).json({
      success: true,
      message: 'Leave application approved successfully',
      data: leaveApplication
    });
  } catch (error) {
    console.error('Approve leave application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving leave application',
      error: error.message
    });
  }
};

// Reject leave application
export const rejectLeaveApplication = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    // if (!rejectionReason) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Rejection reason is required'
    //   });
    // }
    
    const leaveApplication = await LeaveApplication.findById(req.params.id);
    
    if (!leaveApplication) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      }); 
    }
    
    // Check if user has permission to reject
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reject leave applications'
      });
    }
    
    // If manager, check if they manage the user who applied
    if (req.user.role === 'manager') {
      const applicantUser = await User.findById(leaveApplication.user);
      const hasCommonMotel = applicantUser.assignedMotels.some(
        motelId => req.user.assignedMotels.includes(motelId.toString())
      );
      
      if (!hasCommonMotel) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to reject this leave application'
        });
      }
    }
    
    // Can only reject if status is Pending
    if (leaveApplication.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject leave application that has already been processed'
      });
    }
    
    leaveApplication.status = 'Rejected';
    leaveApplication.approvedBy = req.user._id;
    leaveApplication.approvalDate = new Date();
    leaveApplication.rejectionReason = rejectionReason;
    
    await leaveApplication.save();
    
    res.status(200).json({
      success: true,
      message: 'Leave application rejected successfully',
      data: leaveApplication
    });
  } catch (error) {
    console.error('Reject leave application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting leave application',
      error: error.message
    });
  }
};

// Get leave applications for current user
export const getMyLeaveApplications = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let query = { user: req.user._id };
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by date range if provided
    if (startDate && endDate) {
      query.$or = [
        // Leave starts within the range
        { 
          startDate: { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
          } 
        },
        // Leave ends within the range
        { 
          endDate: { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
          } 
        },
        // Leave spans the entire range
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(endDate) }
        }
      ];
    }
    
    // Set up pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const leaveApplications = await LeaveApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('approvedBy', 'username firstName lastName');
    
    const total = await LeaveApplication.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: leaveApplications.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: leaveApplications
    });
  } catch (error) {
    console.error('Get my leave applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving leave applications',
      error: error.message
    });
  }
};

// Get leave applications for users managed by current manager
export const getManagedLeaveApplications = async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }
    
    const { status, userId, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // If admin, can see all applications
    if (req.user.role === 'admin') {
      if (userId) {
        query.user = userId;
      }
    } else {
      // Manager can only see applications from users they manage
      const managedMotels = req.user.assignedMotels;
      const managedUsers = await User.find({ 
        assignedMotels: { $in: managedMotels },
        _id: { $ne: req.user._id }
      }).select('_id');
      
      const managedUserIds = managedUsers.map(user => user._id);
      
      if (userId) {
        // If specific user requested, check if manager manages them
        if (!managedUserIds.some(id => id.toString() === userId)) {
          return res.status(403).json({
            success: false,
            message: 'You do not manage this user'
          });
        }
        query.user = userId;
      } else {
        query.user = { $in: managedUserIds };
      }
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by date range if provided
    if (startDate && endDate) {
      query.$or = [
        // Leave starts within the range
        { 
          startDate: { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
          } 
        },
        // Leave ends within the range
        { 
          endDate: { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
          } 
        },
        // Leave spans the entire range
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(endDate) }
        }
      ];
    }
    
    // Set up pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const leaveApplications = await LeaveApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username firstName lastName email')
      .populate('approvedBy', 'username firstName lastName');
    
    const total = await LeaveApplication.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: leaveApplications.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: leaveApplications
    });
  } catch (error) {
    console.error('Get managed leave applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving leave applications',
      error: error.message
    });
  }
};
