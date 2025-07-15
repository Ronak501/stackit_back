import express from "express";
import { getUsers, getUserById, removeAssignedMotel,getMotelById, createUser, updateUser, deleteUser, updateProfile, changePassword, assignMotels } from '../controllers/user.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
const router = express.Router();

// User profile routes
router.put('/profile', verifyToken, updateProfile);
router.post('/change-password', verifyToken, changePassword);
// Admin routes
router.get('/', verifyToken, isAdmin, getUsers);
router.get('/:id', verifyToken, isAdmin, getUserById);
router.get('/:id', verifyToken, getMotelById); // For user to view their own profile
router.post('/', verifyToken, isAdmin, createUser);
router.put('/:id', verifyToken, isAdmin, updateUser);
router.delete('/:id', verifyToken, isAdmin, deleteUser);
router.post('/:id/assign-motels', verifyToken, isAdmin, assignMotels);
router.delete("/:userId/motel/:motelId",verifyToken, removeAssignedMotel);

export default router;