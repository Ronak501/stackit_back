// Global error handler
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle different types of errors
    if (err.name === 'ValidationError') {
      // Mongoose validation error
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    if (err.name === 'CastError') {
      // Mongoose cast error (invalid ID)
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error',
        field: Object.keys(err.keyValue)[0]
      });
    }
    
    // Default error response
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  // Not found handler
  export const notFound = (req, res, next) => {
    const error = new Error(`Route not found - ${req.method} ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  