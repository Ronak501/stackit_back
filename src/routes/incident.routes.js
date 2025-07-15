import express from "express";
import { getIncidents, getIncidentById, createIncident, updateIncident, deleteIncident, getIncidentsByRoom, getIncidentsByType } from '../controllers/incident.controller.js';
import { verifyToken, hasMotelAccess } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', verifyToken, getIncidents);
router.get('/:id', verifyToken, getIncidentById);
router.post('/', verifyToken, createIncident);
router.put('/:id', verifyToken, updateIncident);
router.delete('/:id', verifyToken, deleteIncident);
router.get('/room/:roomId', verifyToken, getIncidentsByRoom);
router.get('/type/:type', verifyToken, getIncidentsByType);

export default router;
