import express from "express";
import { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, getRoomsByMotel, toggleDnrStatus, updateRoomPrice } from '../controllers/room.controller.js';
import { verifyToken, hasMotelAccess } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', verifyToken, getRooms);
router.get('/:id', verifyToken, getRoomById);
router.post('/', verifyToken, createRoom);
router.put('/:id', verifyToken, updateRoom);
router.delete('/:id', verifyToken, deleteRoom);
router.get('/motel/:motelId', verifyToken, hasMotelAccess, getRoomsByMotel);
router.patch('/:id/toggle-dnr', verifyToken, toggleDnrStatus);
router.patch("/:id/price", verifyToken, updateRoomPrice);

export default router;
