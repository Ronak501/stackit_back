import express from "express";
import { getInspections, getInspectionById, createInspection, updateInspection, deleteInspection, getInspectionsByMotel, completeInspection, scheduleFollowUp } from '../controllers/annualInspection.controller.js';
import { verifyToken, hasMotelAccess, isAdmin } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', verifyToken, getInspections);
router.get('/:id', verifyToken, getInspectionById);
router.post('/', verifyToken, isAdmin, createInspection);
router.put('/:id', verifyToken, isAdmin, updateInspection);
router.delete('/:id', verifyToken, isAdmin, deleteInspection);
router.get('/motel/:motelId', verifyToken, hasMotelAccess, getInspectionsByMotel);
router.patch('/:id/complete', verifyToken, isAdmin, completeInspection);
router.patch('/:id/follow-up', verifyToken, isAdmin, scheduleFollowUp);

export default router;
