import County from '../models/county.model.js';

// Get all counties
export const getCounties = async (req, res) => {
  try {
    const counties = await County.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: counties.length,
      data: counties
    });
  } catch (error) {
    console.error('Get counties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving counties',
      error: error.message
    });
  }
};

// Get county by ID
export const getCountyById = async (req, res) => {
  try {
    const county = await County.findById(req.params.id);
    
    if (!county) {
      return res.status(404).json({
        success: false,
        message: 'County not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: county
    });
  } catch (error) {
    console.error('Get county by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving county',
      error: error.message
    });
  }
};

// Create county
export const createCounty = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if county already exists
    const existingCounty = await County.findOne({ name: name.trim() });
    if (existingCounty) {
      return res.status(400).json({
        success: false,
        message: 'County already exists'
      });
    }
    
    // Create new county
    const county = new County({
      name: name.trim()
    });
    
    await county.save();
    
    res.status(201).json({
      success: true,
      message: 'County created successfully',
      data: county
    });
  } catch (error) {
    console.error('Create county error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating county',
      error: error.message
    });
  }
};

// Update county
export const updateCounty = async (req, res) => {
  try {
    const { name } = req.body;
    
    const county = await County.findById(req.params.id);
    if (!county) {
      return res.status(404).json({
        success: false,
        message: 'County not found'
      });
    }
    
    // Check if new name already exists
    if (name && name !== county.name) {
      const existingCounty = await County.findOne({ name: name.trim() });
      if (existingCounty) {
        return res.status(400).json({
          success: false,
          message: 'County with this name already exists'
        });
      }
    }
    
    // Update name
    if (name) county.name = name.trim();
    
    await county.save();
    
    res.status(200).json({
      success: true,
      message: 'County updated successfully',
      data: county
    });
  } catch (error) {
    console.error('Update county error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating county',
      error: error.message
    });
  }
};

// Delete county
export const deleteCounty = async (req, res) => {
  try {
    const county = await County.findById(req.params.id);
    if (!county) {
      return res.status(404).json({
        success: false,
        message: 'County not found'
      });
    }
    
    // Check if county is associated with any rooms
    const Room = mongoose.model('Room');
    const roomsWithCounty = await Room.countDocuments({ county: county._id });
    
    if (roomsWithCounty > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete county. It is associated with ${roomsWithCounty} room(s).`
      });
    }
    
    await county.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'County deleted successfully'
    });
  } catch (error) {
    console.error('Delete county error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting county',
      error: error.message
    });
  }
};
