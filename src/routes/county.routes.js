import express from "express";
import { getCounties, getCountyById, createCounty, updateCounty, deleteCounty } from '../controllers/county.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', verifyToken, getCounties);
router.get('/:id', verifyToken, getCountyById);
router.post('/', verifyToken, isAdmin, createCounty);
router.put('/:id', verifyToken, isAdmin, updateCounty);
router.delete('/:id', verifyToken, isAdmin, deleteCounty);

export default router;
