import Room from '../models/room.model.js';
import Motel from '../models/motel.model.js';
import County from '../models/county.model.js';
import mongoose from 'mongoose';

// Get all rooms
export const getRooms = async (req, res) => {
  try {
    const { motelId, number, dnr, countyId } = req.query;
    let query = {};
    
    if (motelId) {
      query.motel = motelId;
    }
    
    if (number) {
      query.number = { $regex: number, $options: 'i' };
    }
    
    if (dnr !== undefined) {
      query.dnr = dnr === 'true';
    }
    
    if (countyId) {
      query.county = countyId;
    }
    
    const rooms = await Room.find(query)
      .populate('motel', 'name')
      .populate('county', 'name')
      .sort({ 'motel.name': 1, number: 1 });
    
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving rooms',
      error: error.message
    });
  }
};

// Get room by ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('motel', 'name address contactNumber email')
      .populate('county', 'name');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Get room by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving room',
      error: error.message
    });
  }
};

// // Create room
// export const createRoom = async (req, res) => {
//   try {
//     const { motelId, number, dnr, countyId } = req.body;
    
//     // Validate motel exists
//     const motel = await Motel.findById(motelId);
//     if (!motel) {
//       return res.status(404).json({
//         success: false,
//         message: 'Motel not found'
//       });
//     }
    
//     // // Validate county exists if provided
//     // if (countyId) {
//     //   const county = await County.findById(countyId);
//     //   if (!county) {
//     //     return res.status(404).json({
//     //       success: false,
//     //       message: 'County not found'
//     //     });
//     //   }
//     // }
    
//     // Check if room number already exists for this motel
//     const existingRoom = await Room.findOne({ motel: motelId, number });
//     if (existingRoom) {
//       return res.status(400).json({
//         success: false,
//         message: 'A room with this number already exists in the motel'
//       });
//     }
    
//     const room = new Room({
//       motel: motelId,
//       number,
//       dnr: dnr || false,
//       // county: countyId
//     });
    
//     await room.save();
    
//     res.status(201).json({
//       success: true,
//       message: 'Room created successfully',
//       data: room
//     });
//   } catch (error) {
//     console.error('Create room error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating room',
//       error: error.message
//     });
//   }
// };

export const createRoom = async (req, res) => {
  try {
    const { motelId, number, dnr, price} = req.body;
    
    // Validate motel exists
    const motel = await Motel.findById(motelId);
    if (!motel) {
      return res.status(404).json({
        success: false,
        message: 'Motel not found'
      });
    }

    const findRoom = await Room.findOne({ motel: motelId, number: number });
    if (findRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists',
      });
    }
    
    // // Validate county exists if provided
    // if (countyId) {
    //   const county = await County.findById(countyId);
    //   if (!county) {
    //     return res.status(404).json({
    //       success: false,
    //       message: 'County not found'
    //     });
    //   }
    // }
    
    // Check if room number already exists for this motel
    const existingRoom = await Room.findOne({ motel: motelId, number });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'A room with this number already exists in the motel'
      });
    }
    
    const room = new Room({
      motel: motelId,
      number,
      dnr: dnr || false,
      price: price || 0,
    });
    
    await room.save();
    
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};
// Update room
export const updateRoom = async (req, res) => {
  try {
    const { number, dnr, countyId } = req.body;
    
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check if new room number is already taken in the same motel
    if (number && number !== room.number) {
      const existingRoom = await Room.findOne({ motel: room.motel, number });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: 'A room with this number already exists in the motel'
        });
      }
    }
    
    // Validate county exists if provided
    if (countyId) {
      const county = await County.findById(countyId);
      if (!county) {
        return res.status(404).json({
          success: false,
          message: 'County not found'
        });
      }
    }
    
    // Update fields
    if (number) room.number = number;
    if (dnr !== undefined) room.dnr = dnr;
    if (countyId !== undefined) room.county = countyId;
    room.dateUpdated = new Date();
    
    await room.save();
    
    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message
    });
  }
};

export const updateRoomPrice = async (req, res) => {
  try {
    const { price } = req.body;

    if (price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Price is required",
      });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    room.price = price;
    room.dateUpdated = new Date();

    await room.save();

    res.status(200).json({
      success: true,
      message: "Room price updated successfully",
      data: room,
    });
  } catch (error) {
    console.error("Update room price error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating room price",
      error: error.message,
    });
  }
};

// Delete room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    await room.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
};

// Get rooms by motel
export const getRoomsByMotel = async (req, res) => {
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
    
    const rooms = await Room.find({ motel: motelId })
      .populate('county', 'name')
      .sort({ number: 1 });
    
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('Get rooms by motel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving rooms',
      error: error.message
    });
  }
};

// Toggle DNR status
export const toggleDnrStatus = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    room.dnr = !room.dnr;
    room.dateUpdated = new Date();
    await room.save();
    
    res.status(200).json({
      success: true,
      message: `DNR status ${room.dnr ? 'enabled' : 'disabled'} for room`,
      data: room
    });
  } catch (error) {
    console.error('Toggle DNR status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling DNR status',
      error: error.message
    });
  }
};
