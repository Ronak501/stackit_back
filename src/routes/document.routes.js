import express from "express";
import { getDocuments, getDocumentById, uploadDocument, updateDocument, deleteDocument, getDocumentsByRoom } from '../controllers/document.controller.js';
import { verifyToken, hasMotelAccess } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { handleDriveUpload } from '../middleware/upload.middleware.js';
const router = express.Router();

router.get('/', verifyToken, getDocuments);
router.get('/:id', verifyToken, getDocumentById);
router.post('/', verifyToken, upload.single('file'),handleDriveUpload, uploadDocument);
router.put('/:id', verifyToken, updateDocument);
router.delete('/:id', verifyToken, deleteDocument);
router.get('/room/:roomId', verifyToken, getDocumentsByRoom);

export default router;
