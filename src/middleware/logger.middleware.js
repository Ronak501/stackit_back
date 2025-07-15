export const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log request details
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    
    // Log request body if present (except for file uploads and sensitive data)
    if (req.body && Object.keys(req.body).length > 0 && req.get('Content-Type') !== 'multipart/form-data') {
      const sanitizedBody = { ...req.body };
      
      // Remove sensitive information
      if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
      if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
      
      console.log('Request Body:', sanitizedBody);
    }
    
    // Capture response data
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    
    next();
  };
  