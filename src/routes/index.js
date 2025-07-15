import express from "express";
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import motelRoutes from './motel.routes.js';
import roomRoutes from './room.routes.js';
import documentRoutes from './document.routes.js';
import incidentRoutes from './incident.routes.js';
import countyRoutes from './county.routes.js';
import maintenanceRoutes from './maintenance.routes.js';
import complaintRoutes from './complaint.routes.js';
import suggestionRoutes from './suggestion.routes.js';
import annualInspectionRoutes from './annualInspection.routes.js';
import customerRoutes from './customer.routes.js';
import leaveApplicationRoutes from './leaveApplication.routes.js';
import employeeScheduleRoutes from "./employeeSchedule.routes.js";
import customerHistoryRoutes from './customerHistory.routes.js';

//new imports
import askRoutes from "./ask.routes.js";

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/motels', motelRoutes);
router.use('/rooms', roomRoutes);
router.use('/documents', documentRoutes);
router.use('/incidents', incidentRoutes);
router.use('/counties', countyRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/complaints', complaintRoutes);
router.use('/suggestions', suggestionRoutes);
router.use('/inspections', annualInspectionRoutes);
router.use('/customer',customerRoutes);
router.use('/leave-applications', leaveApplicationRoutes);
router.use('/schedules', employeeScheduleRoutes);
router.use('/customer-history', customerHistoryRoutes);

//new route
router.use('/ask', askRoutes);

export default router;
