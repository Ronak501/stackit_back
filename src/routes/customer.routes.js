import express from "express";
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer,blacklistCustomer, removeFromBlacklist, checkBlacklistStatus } from '../controllers/customer.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route for quick blacklist check
router.get('/check-blacklist', checkBlacklistStatus);

// Protected routes
router.get('/', verifyToken, getCustomers);
router.get('/:id', verifyToken, getCustomerById);
router.post('/', verifyToken, createCustomer);
router.put('/:id', verifyToken, updateCustomer);
router.delete('/:id', verifyToken, deleteCustomer);
router.patch('/:id/blacklist', verifyToken, blacklistCustomer);
router.patch('/:id/remove-blacklist', verifyToken, isAdmin, removeFromBlacklist);

export default router;
