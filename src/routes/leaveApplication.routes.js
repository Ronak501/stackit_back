import express from "express";
import { 
  getLeaveApplications, 
  getLeaveApplicationById, 
  createLeaveApplication, 
  updateLeaveApplication, 
  deleteLeaveApplication,
  approveLeaveApplication,
  rejectLeaveApplication,
  getMyLeaveApplications,
  getManagedLeaveApplications
} from '../controllers/leaveApplication.controller.js';
import { verifyToken, isAdmin, isManagerOrAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes for all users
router.get('/my-applications', verifyToken, getMyLeaveApplications);
router.post('/', verifyToken, createLeaveApplication);
router.get('/:id', verifyToken, getLeaveApplicationById);
router.put('/:id', verifyToken, updateLeaveApplication);
router.delete('/:id', verifyToken, deleteLeaveApplication);

// Routes for managers and admins
router.get('/managed/applications', verifyToken, isManagerOrAdmin, getManagedLeaveApplications);
router.patch('/:id/approve', verifyToken, isManagerOrAdmin, approveLeaveApplication);
router.patch('/:id/reject', verifyToken, isManagerOrAdmin, rejectLeaveApplication);

// Admin-only routes
router.get('/', verifyToken, isAdmin, getLeaveApplications);

export default router;
