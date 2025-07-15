import express from "express";
import { getMaintenanceRecords, getMaintenanceById, createMaintenance, updateMaintenance, deleteMaintenance, getMaintenanceByMotel, markAsCompleted } from '../controllers/maintenance.controller.js';
import { verifyToken, hasMotelAccess } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', verifyToken, getMaintenanceRecords);
router.get('/:id', verifyToken, getMaintenanceById);
router.post('/', verifyToken, createMaintenance);
router.put('/:id', verifyToken, updateMaintenance);
router.delete('/:id', verifyToken, deleteMaintenance);
router.get('/motel/:motelId', verifyToken, hasMotelAccess, getMaintenanceByMotel);
router.patch('/:id/complete', verifyToken, markAsCompleted);

export default router;
