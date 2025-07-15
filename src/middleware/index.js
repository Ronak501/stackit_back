import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import corsMiddleware from './cors.middleware.js';
import { requestLogger } from './logger.middleware.js';
import { basicLimiter, authLimiter } from './rateLimit.middleware.js';

import { errorHandler, notFound } from './error.middleware.js';
import upload, { handleDriveUpload } from './upload.middleware.js';
import { verifyToken, isAdmin, hasMotelAccess } from './auth.middleware.js';

// Export all middleware for individual use
export {
  // Authentication middleware
  verifyToken,
  isAdmin,
  hasMotelAccess,
  
  // File upload middleware
  upload,
  handleDriveUpload,
  
  // Error handling middleware
  errorHandler,
  notFound,
  
  // Logging middleware
  requestLogger,
  
  // Rate limiting middleware
  basicLimiter,
  authLimiter,
  
  // CORS middleware
  corsMiddleware
};

// Register all middleware for Express app
export const registerMiddleware = (app) => {
  // Security middleware
  app.use(helmet());
  app.use(corsMiddleware);
  
  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // First register the built-in middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Performance middleware
  app.use(compression());
  
  // Rate limiting
  app.use(basicLimiter);
  
  // Logging
  app.use(requestLogger);
  
  // File upload error handling
  app.use(handleDriveUpload);
  
  // Static files
  app.use('/uploads', express.static('uploads'));
  
  return app;
};

// Register error handling middleware (should be called after routes)
export const registerErrorHandlers = (app) => {
  app.use(notFound);
  app.use(errorHandler);
  
  return app;
};

// Default export for convenience
export default {
  registerMiddleware,
  registerErrorHandlers
};
