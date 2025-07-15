import express from "express";
import { getMotels, getMotelById, createMotel, updateMotel, deleteMotel, getMotelStats } from '../controllers/motel.controller.js';
import { verifyToken, isAdmin, hasMotelAccess } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', verifyToken, getMotels);
router.get('/:id', verifyToken, hasMotelAccess, getMotelById);
router.post('/', verifyToken, isAdmin, createMotel);
router.put('/:id', verifyToken, isAdmin, updateMotel);
router.delete('/:id', verifyToken, isAdmin, deleteMotel);
router.get('/:id/stats', verifyToken, hasMotelAccess, getMotelStats);

export default router;
