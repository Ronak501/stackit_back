import express from "express";
import { getSuggestions, getSuggestionById, createSuggestion, updateSuggestion, deleteSuggestion, getSuggestionsByMotel, implementSuggestion, rejectSuggestion } from '../controllers/suggestion.controller.js';
import { verifyToken, hasMotelAccess } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', verifyToken, getSuggestions);
router.get('/:id', verifyToken, getSuggestionById);
router.post('/', verifyToken, createSuggestion);
router.put('/:id', verifyToken, updateSuggestion);
router.delete('/:id', verifyToken, deleteSuggestion);
router.get('/motel/:motelId', verifyToken, hasMotelAccess, getSuggestionsByMotel);
router.patch('/:id/implement', verifyToken, implementSuggestion);
router.patch('/:id/reject', verifyToken, rejectSuggestion);

export default router;
