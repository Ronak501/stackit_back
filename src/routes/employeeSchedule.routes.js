import express from "express";
import { 
  getSchedules, 
  createSchedule, 
  updateSchedule, 
  deleteSchedule,
  getSchedulesByMotel
} from '../controllers/employeeSchedule.controller.js';
import { verifyToken, isAdmin, hasMotelAccess } from '../middleware/auth.middleware.js';

const router = express.Router();

// Base routes
router.get('/', verifyToken, getSchedules);
router.post('/', verifyToken, isAdmin, createSchedule);
router.put('/:id', verifyToken, isAdmin, updateSchedule);
router.delete('/:id', verifyToken, isAdmin, deleteSchedule);

// Motel-specific routes
router.get('/motel/:motelId', verifyToken, hasMotelAccess, getSchedulesByMotel);

export default router;
