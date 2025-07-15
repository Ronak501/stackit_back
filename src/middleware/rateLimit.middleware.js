import rateLimit from 'express-rate-limit';

// Basic rate limiter for all routes
export const basicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 900, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  validate: {
    xForwardedForHeader: false
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 10 login attempts per hour
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after an hour'
  },
  validate: {
    xForwardedForHeader: false
  },
  standardHeaders: true,
  legacyHeaders: false,
});
