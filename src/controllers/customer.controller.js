import Customer from '../models/customer.model.js';
import mongoose from 'mongoose';

// Get all customers with filtering options
export const getCustomers = async (req, res) => {
  try {
    const { search, isBlacklisted, state, sortBy, page = 1, limit = 20} = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { idNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by blacklist status
    if (isBlacklisted !== undefined) {
      query.isBlacklisted = isBlacklisted === 'true';
    }
    
    // Filter by state
    if (state) {
      query['address.state'] = state;
    }
    
    // Set up pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Set up sorting
    let sortOptions = { createdAt: -1 }; // Default sort by creation date
    if (sortBy) {
      if (sortBy === 'name') {
        sortOptions = { lastName: 1, firstName: 1 };
      } else if (sortBy === 'blacklistedDate') {
        sortOptions = { blacklistedDate: -1 };
      }
    }
    
    const customers = await Customer.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName')
      .populate('blacklistedBy', 'username firstName lastName');
    
    const total = await Customer.countDocuments(query);
    
    res.status(200).json({success: true,count: customers.length,total,totalPages: Math.ceil(total / parseInt(limit)),currentPage: parseInt(page),data: customers});
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving customers',
      error: error.message
    });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('blacklistedBy', 'username firstName lastName');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving customer',
      error: error.message
    });
  }
};

// Create customer
export const createCustomer = async (req, res) => {
  try {
    const { firstName, lastName, phone, date, time, countyName, property} = req.body;
    
    // Check if customer already exists with same ID
    if (phone) {
      const existingCustomer = await Customer.findOne({ phone });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'A customer with this Phone already exists',
          existingCustomer: {
            id: existingCustomer._id,
            name: `${existingCustomer.firstName} ${existingCustomer.lastName}`,
            isBlacklisted: existingCustomer.isBlacklisted
          }
        });
      }
    }
    
    const customer = new Customer({
      firstName,
      lastName,
      phone,
      date,
      time,
      countyName,
      property,
      createdBy: req.user._id,
    });
    
    await customer.save();
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, idType, idNumber, address} = req.body;
    
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Update fields if provided
    if (firstName) customer.firstName = firstName;
    if (lastName) customer.lastName = lastName;
    if (email) customer.email = email;
    if (phone) customer.phone = phone;
    if (idType) customer.idType = idType;
    if (idNumber) customer.idNumber = idNumber;
    if (address) customer.address = {...customer.address, ...address};
    
    await customer.save();
    
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    await customer.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};

// Blacklist customer
export const blacklistCustomer = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Blacklist reason is required'
      });
    }
    
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    customer.isBlacklisted = true;
    customer.blacklistReason = reason;
    customer.blacklistedDate = new Date();
    customer.blacklistedBy = req.user._id;
    
    await customer.save();
    
    res.status(200).json({
      success: true,
      message: 'Customer has been blacklisted',
      data: customer
    });
  } catch (error) {
    console.error('Blacklist customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error blacklisting customer',
      error: error.message
    });
  }
};

// Remove customer from blacklist
export const removeFromBlacklist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    customer.isBlacklisted = false;
    customer.blacklistReason = undefined;
    customer.blacklistedDate = undefined;
    customer.blacklistedBy = undefined;
    
    await customer.save();
    
    res.status(200).json({
      success: true,
      message: 'Customer has been removed from blacklist',
      data: customer
    });
  } catch (error) {
    console.error('Remove from blacklist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing customer from blacklist',
      error: error.message
    });
  }
};

// Check if customer is blacklisted
export const checkBlacklistStatus = async (req, res) => {
  try {
    const { idType, idNumber } = req.query;
    
    if (!idType || !idNumber) {
      return res.status(400).json({
        success: false,
        message: 'ID type and ID number are required'
      });
    }
    
    const customer = await Customer.findOne({ idType, idNumber })
      .select('firstName lastName isBlacklisted blacklistReason blacklistedDate');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: customer._id,
        name: `${customer.firstName} ${customer.lastName}`,
        isBlacklisted: customer.isBlacklisted,
        blacklistReason: customer.blacklistReason,
        blacklistedDate: customer.blacklistedDate
      }
    });
  } catch (error) {
    console.error('Check blacklist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking blacklist status',
      error: error.message
    });
  }
};
