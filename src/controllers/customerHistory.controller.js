import CustomerHistory from '../models/customerHistory.model.js';
import Customer from '../models/customer.model.js';
import Room from '../models/room.model.js';
import Motel from '../models/motel.model.js';
import mongoose from 'mongoose';

export const getCustomerHistories = async (req, res) => {
  try {
    const { customerId, roomId, motelId, startDate, endDate, page = 1, limit = 20 } = req.query;
    let query = {};
    
    // Apply filters
    if (customerId) {
      query.customer = customerId;
    }
    
    if (roomId) {
      query.room = roomId;
    }
    
    if (motelId) {
      query.motel = motelId;
    }
    
    if (startDate && endDate) {
      query.$or = [
        { checkInDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { checkOutDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        {
          $and: [
            { checkInDate: { $lte: new Date(startDate) } },
            { checkOutDate: { $gte: new Date(endDate) } }
          ]
        }
      ];
    } else if (startDate) {
      query.$or = [
        { checkInDate: { $gte: new Date(startDate) } },
        { checkOutDate: { $gte: new Date(startDate) } }
      ];
    } else if (endDate) {
      query.$or = [
        { checkInDate: { $lte: new Date(endDate) } },
        { checkOutDate: { $lte: new Date(endDate) } }
      ];
    }
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const customerHistories = await CustomerHistory.find(query)
      .populate('customer', 'firstName lastName email phone idNumber')
      .populate({
        path: 'room',
        select: 'number motel',
        populate: {
          path: 'motel',
          select: 'name'
        }
      })
      .populate('documents', 'name url uploadDate')
      .populate('createdBy', 'username firstName lastName')
      .sort({ checkInDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await CustomerHistory.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: customerHistories.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: customerHistories
    });
  } catch (error) {
    console.error('Get customer histories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving customer histories',
      error: error.message
    });
  }
};

// Get customer history by ID
export const getCustomerHistoryById = async (req, res) => {
  try {
    const customerHistory = await CustomerHistory.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone idNumber')
      .populate({
        path: 'room',
        select: 'number motel',
        populate: {
          path: 'motel',
          select: 'name address'
        }
      })
      .populate('documents', 'name url uploadDate')
      .populate('createdBy', 'username firstName lastName');
    
    if (!customerHistory) {
      return res.status(404).json({
        success: false,
        message: 'Customer history record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: customerHistory
    });
  } catch (error) {
    console.error('Get customer history by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving customer history',
      error: error.message
    });
  }
};

// Create customer history record
export const createCustomerHistory = async (req, res) => {
  try {
    const { customerId, roomId, checkInDate, checkOutDate, documents, paymentAmount, paymentMethod, notes } = req.body;
    
    // Validate customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Validate room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Get motel ID from room
    const motelId = room.motel;
    
    // Check if room is already occupied during the specified period
    // const overlappingBookings = await CustomerHistory.find({
    //   room: roomId,
    //   $or: [
    //     { checkInDate: { $lte: new Date(checkOutDate), $gte: new Date(checkInDate) } },
    //     { checkOutDate: { $gte: new Date(checkInDate), $lte: new Date(checkOutDate) } },
    //     {
    //       $and: [
    //         { checkInDate: { $lte: new Date(checkInDate) } },
    //         { checkOutDate: { $gte: new Date(checkOutDate) } }
    //       ]
    //     }
    //   ]
    // });
    //
    // if (overlappingBookings.length > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Room is already occupied during this period'
    //   });
    // }
    
    // Create customer history record
    const customerHistory = new CustomerHistory({
      customer: customerId,
      room: roomId,
      motel: motelId,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      documents: documents || [],
      paymentAmount,
      paymentMethod,
      notes,
      createdBy: req.user._id
    });
    
    await customerHistory.save();
    
    res.status(201).json({
      success: true,
      message: 'Customer history record created successfully',
      data: customerHistory
    });
  } catch (error) {
    console.error('Create customer history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer history record',
      error: error.message
    });
  }
};

// Update the existing updateCustomerHistory function to include updatedBy
export const updateCustomerHistory = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, documents, paymentAmount, paymentMethod, notes } = req.body;
    
    const customerHistory = await CustomerHistory.findById(req.params.id);
    if (!customerHistory) {
      return res.status(404).json({
        success: false,
        message: 'Customer history record not found'
      });
    }
    
    // Update fields if provided
    if (checkInDate) customerHistory.checkInDate = new Date(checkInDate);
    if (checkOutDate) customerHistory.checkOutDate = new Date(checkOutDate);
    if (documents) customerHistory.documents = documents;
    if (paymentAmount !== undefined) customerHistory.paymentAmount = paymentAmount;
    if (paymentMethod) customerHistory.paymentMethod = paymentMethod;
    if (notes !== undefined) customerHistory.notes = notes;
    
    // Set updatedBy to current user
    customerHistory.updatedBy = req.user._id;
    
    await customerHistory.save();
    
    res.status(200).json({
      success: true,
      message: 'Customer history record updated successfully',
      data: customerHistory
    });
  } catch (error) {
    console.error('Update customer history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer history record',
      error: error.message
    });
  }
};


// Delete customer history record
export const deleteCustomerHistory = async (req, res) => {
  try {
    const customerHistory = await CustomerHistory.findById(req.params.id);
    if (!customerHistory) {
      return res.status(404).json({
        success: false,
        message: 'Customer history record not found'
      });
    }
    
    await customerHistory.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Customer history record deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer history record',
      error: error.message
    });
  }
};

// Get customer history by customer
export const getCustomerHistoryByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Validate customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    const customerHistories = await CustomerHistory.find({ customer: customerId })
      .populate({
        path: 'room',
        select: 'number motel',
        populate: {
          path: 'motel',
          select: 'name'
        }
      })
      .populate('documents', 'name url uploadDate')
      .sort({ checkInDate: -1 });
    
    res.status(200).json({
      success: true,
      count: customerHistories.length,
      data: customerHistories
    });
  } catch (error) {
    console.error('Get customer history by customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving customer history',
      error: error.message
    });
  }
};

// Get customer history by room
export const getCustomerHistoryByRoom = async (req, res) => {
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
    
    const customerHistories = await CustomerHistory.find({ room: roomId })
      .populate('customer', 'firstName lastName email phone idNumber')
      .populate('documents', 'name url uploadDate')
      .sort({ checkInDate: -1 });
    
    res.status(200).json({
      success: true,
      count: customerHistories.length,
      data: customerHistories
    });
  } catch (error) {
    console.error('Get customer history by room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving customer history',
      error: error.message
    });
  }
};

// Add document to customer history
export const addDocumentToHistory = async (req, res) => {
  try {
    const { documentId } = req.body;
    
    const customerHistory = await CustomerHistory.findById(req.params.id);
    if (!customerHistory) {
      return res.status(404).json({
        success: false,
        message: 'Customer history record not found'
      });
    }
    
    // Add document if not already in the list
    if (!customerHistory.documents.includes(documentId)) {
      customerHistory.documents.push(documentId);
      await customerHistory.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Document added to customer history successfully',
      data: customerHistory
    });
  } catch (error) {
    console.error('Add document to history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding document to customer history',
      error: error.message
    });
  }
};

// Get current occupancy report
export const getCurrentOccupancy = async (req, res) => {
  try {
    const { motelId } = req.query;
    const currentDate = new Date();
    
    let query = {
      checkInDate: { $lte: currentDate },
      checkOutDate: { $gte: currentDate }
    };
    
    if (motelId) {
      query.motel = motelId;
    }
    
    const occupiedRooms = await CustomerHistory.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate({
        path: 'room',
        select: 'number motel',
        populate: {
          path: 'motel',
          select: 'name'
        }
      })
      .sort({ 'room.number': 1 });
    
    res.status(200).json({
      success: true,
      count: occupiedRooms.length,
      data: occupiedRooms
    });
  } catch (error) {
    console.error('Get current occupancy error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving current occupancy',
      error: error.message
    });
  }
};

// Get active customer in a specific room
export const getActiveCustomerByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentDate = new Date();
    
    // Validate room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Find active customer (check-in <= current date <= check-out)
    const activeCustomer = await CustomerHistory.findOne({
      room: roomId,
      checkInDate: { $lte: currentDate },
      checkOutDate: { $gte: currentDate }
    })
    .populate('customer', 'firstName lastName email phone')
    .populate({
      path: 'room',
      select: 'number motel',
      populate: {
        path: 'motel',
        select: 'name'
      }
    })
    .populate('documents', 'name url uploadDate')
    .populate('createdBy', 'username firstName lastName')
    .populate('updatedBy', 'username firstName lastName')
    .sort({ checkInDate: -1 }); // Get the most recent if multiple exist
    
    if (!activeCustomer) {
      return res.status(404).json({
        success: false,
        message: 'No active customer found in this room'
      });
    }
    
    res.status(200).json({
      success: true,
      data: activeCustomer
    });
  } catch (error) {
    console.error('Get active customer by room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving active customer',
      error: error.message
    });
  }
};