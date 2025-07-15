import express from "express";
import { getComplaints, getComplaintById, createComplaint, updateComplaint, deleteComplaint, getComplaintsByMotel, resolveComplaint } from '../controllers/complaint.controller.js';
import { verifyToken, hasMotelAccess } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', verifyToken, getComplaints);
router.get('/:id', verifyToken, getComplaintById);
router.post('/', verifyToken, createComplaint);
router.put('/:id', verifyToken, updateComplaint);
router.delete('/:id', verifyToken, deleteComplaint);
router.get('/motel/:motelId', verifyToken, hasMotelAccess, getComplaintsByMotel);
router.patch('/:id/resolve', verifyToken, resolveComplaint);

export default router;
