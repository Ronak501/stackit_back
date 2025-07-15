import express from "express";
import { 
  getCustomerHistories, 
  getCustomerHistoryById, 
  createCustomerHistory, 
  updateCustomerHistory, 
  deleteCustomerHistory, 
  getCustomerHistoryByCustomer, 
  getCustomerHistoryByRoom,
  addDocumentToHistory,
  getCurrentOccupancy,
  getActiveCustomerByRoom // Add this new import
} from '../controllers/customerHistory.controller.js';
import { verifyToken, hasMotelAccess, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Base routes
router.get('/', verifyToken, getCustomerHistories);
router.get('/current-occupancy', verifyToken, getCurrentOccupancy);
router.get('/:id', verifyToken, getCustomerHistoryById);
router.post('/', verifyToken, createCustomerHistory);
router.put('/:id', verifyToken, updateCustomerHistory);
router.delete('/:id', verifyToken, isAdmin, deleteCustomerHistory);

// Specialized routes
router.get('/customer/:customerId', verifyToken, getCustomerHistoryByCustomer);
router.get('/room/:roomId', verifyToken, getCustomerHistoryByRoom);
router.get('/room/:roomId/active', verifyToken, getActiveCustomerByRoom); // New route
router.post('/:id/add-document', verifyToken, addDocumentToHistory);

export default router;
