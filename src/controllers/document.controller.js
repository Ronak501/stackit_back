import Document from '../models/document.model.js';
import Room from '../models/room.model.js';
import { authorize, deleteFile } from '../utils/drive.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Get all documents
export const getDocuments = async (req, res) => {
  try {
    const { roomId, name, startDate, endDate } = req.query;
    let query = {};
    
    if (roomId) {
      query.room = roomId;
    }
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    if (startDate && endDate) {
      query.uploadDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    const documents = await Document.find(query)
      .populate({
        path: 'room',
        select: 'number motel',
        populate: {
          path: 'motel',
          select: 'name'
        }
      })
      .sort({ uploadDate: -1 });
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving documents',
      error: error.message
    });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate({
        path: 'room',
        select: 'number motel dnr',
        populate: {
          path: 'motel',
          select: 'name'
        }
      });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving document',
      error: error.message
    });
  }
};

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    const { roomId, name } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
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
    
    // Create document record
    const document = new Document({
      room: roomId,
      name: name || req.file.originalname,
      driveId: req.file.driveId,
      category: req.body.category,
      url: req.file.url,
      webViewLink: req.file.webViewLink,
      webContentLink: req.file.webContentLink,
      uploadDate: new Date()
    });
    
    await document.save();
    
    // Update room's dateUpdated field
    room.dateUpdated = new Date();
    await room.save();
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const { name } = req.body;
    
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Update name if provided
    if (name) document.name = name;
    
    await document.save();
    
    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document',
      error: error.message
    });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    const authClient = await authorize();
    await deleteFile(authClient, document.driveId);
    
    // Delete file from storage if it exists
    // if (document.fileUrl) {
    //   try {
    //     fs.unlinkSync(document.fileUrl);
    //   } catch (err) {
    //     console.warn('File could not be deleted:', err);
    //   }
    // }
    
    await document.deleteOne();
    
    // Update room's dateUpdated field
    const room = await Room.findById(document.room);
    if (room) {
      room.dateUpdated = new Date();
      await room.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
};

// Get documents by room
export const getDocumentsByRoom = async (req, res) => {
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
    
    const documents = await Document.find({ room: roomId })
      .sort({ uploadDate: -1 });
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Get documents by room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving documents',
      error: error.message
    });
  }
};
