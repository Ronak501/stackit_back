// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// // Ensure upload directory exists
// const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configure storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const ext = path.extname(file.originalname);
//     cb(null, file.fieldname + '-' + uniqueSuffix + ext);
//   }
// });

// // File filter function
// const fileFilter = (req, file, cb) => {
//   // Accept common document types
//   const allowedFileTypes = [
//     '.pdf', '.doc', '.docx', '.xls', '.xlsx', 
//     '.txt', '.jpg', '.jpeg', '.png', '.gif'
//   ];
  
//   const ext = path.extname(file.originalname).toLowerCase();
  
//   if (allowedFileTypes.includes(ext)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only document and image files are allowed.'), false);
//   }
// };

// // Create multer instance with configuration
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 100 * 1024 * 1024, // 10MB file size limit
//   }
// });

// // Error handling middleware for multer
// export const handleUploadError = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({
//         success: false,
//         message: 'File too large. Maximum size is 10MB.'
//       });
//     }
//     return res.status(400).json({
//       success: false,
//       message: `Upload error: ${err.message}`
//     });
//   } else if (err) {
//     return res.status(400).json({
//       success: false,
//       message: err.message
//     });
//   }
//   next();
// };

// export default upload;

import multer from 'multer';
import { Readable } from 'stream';
import { authorize, uploadFile } from '../utils/drive.js';

// Use memory storage for temporary file handling
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents and images are allowed.'));
    }
  }
});

// Middleware to handle Google Drive uploads
export const handleDriveUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }
    
    const authClient = await authorize();
    
    const driveFile = await uploadFile(authClient, req.file);

    // Add Google Drive file info to the request
    req.file.driveId = driveFile.id;
    req.file.url = driveFile.url;
    req.file.webViewLink = driveFile.webViewLink;
    req.file.webContentLink = driveFile.webContentLink;
    
    next();
  } catch (error) {
    console.error('Drive upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading file to Google Drive',
      error: error.message
    });
  }
};

export default upload;

