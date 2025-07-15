import Suggestion from '../models/suggestion.model.js';
import Motel from '../models/motel.model.js';
import mongoose from 'mongoose';

// Get all suggestions
export const getSuggestions = async (req, res) => {
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
    
    const suggestions = await Suggestion.find(query)
      .populate('motel', 'name')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving suggestions',
      error: error.message
    });
  }
};

// Get suggestion by ID
export const getSuggestionById = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id)
      .populate('motel', 'name address contactNumber email');
    
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    console.error('Get suggestion by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving suggestion',
      error: error.message
    });
  }
};

// Create suggestion
export const createSuggestion = async (req, res) => {
  try {
    const { motelId, description, user, number } = req.body;
    
    // Validate motel exists
    const motel = await Motel.findById(motelId);
    if (!motel) {
      return res.status(404).json({
        success: false,
        message: 'Motel not found'
      });
    }
    
    // Create new suggestion
    const suggestion = new Suggestion({
      motel: motelId,
      user,
      number,
      description,
      date: new Date(),
      status: 'New'
    });
    
    await suggestion.save();
    
    res.status(201).json({
      success: true,
      message: 'Suggestion created successfully',
      data: suggestion
    });
  } catch (error) {
    console.error('Create suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating suggestion',
      error: error.message
    });
  }
};

// Update suggestion
export const updateSuggestion = async (req, res) => {
  try {
    const { description, status } = req.body;
    
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }
    
    // Update fields
    if (description) suggestion.description = description;
    if (status) suggestion.status = status;
    
    await suggestion.save();
    
    res.status(200).json({
      success: true,
      message: 'Suggestion updated successfully',
      data: suggestion
    });
  } catch (error) {
    console.error('Update suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating suggestion',
      error: error.message
    });
  }
};

// Delete suggestion
export const deleteSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }
    
    await suggestion.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Suggestion deleted successfully'
    });
  } catch (error) {
    console.error('Delete suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting suggestion',
      error: error.message
    });
  }
};

// Get suggestions by motel
export const getSuggestionsByMotel = async (req, res) => {
  try {
    const { motelId } = req.params;
    const { status, startDate, endDate } = req.query;
    
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
    
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    const suggestions = await Suggestion.find(query).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    console.error('Get suggestions by motel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving suggestions',
      error: error.message
    });
  }
};

// Implement suggestion
export const implementSuggestion = async (req, res) => {
  try {
    const { implementationDetails } = req.body;
    
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }
    
    suggestion.status = 'Implemented';
    suggestion.implementationDetails = implementationDetails;
    
    await suggestion.save();
    
    res.status(200).json({
      success: true,
      message: 'Suggestion marked as implemented',
      data: suggestion
    });
  } catch (error) {
    console.error('Implement suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error implementing suggestion',
      error: error.message
    });
  }
};

// Reject suggestion
export const rejectSuggestion = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }
    
    suggestion.status = 'Rejected';
    if (reason) {
      suggestion.implementationDetails = `Rejected: ${reason}`;
    }
    
    await suggestion.save();
    
    res.status(200).json({
      success: true,
      message: 'Suggestion rejected',
      data: suggestion
    });
  } catch (error) {
    console.error('Reject suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting suggestion',
      error: error.message
    });
  }
};
