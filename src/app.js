import express from 'express';
import config from './config.js';
import connectDB from './connectDB.js';
import { registerMiddleware, registerErrorHandlers } from './middleware/index.js';
import routes from './routes/index.js';
import logger from './logger.js';

// Connect to MongoDB
connectDB();

const app = express();

// Register middleware
registerMiddleware(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure query parser
app.set('query parser', 'extended');
// API routes
app.use('/api', routes);

app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Stackit API is running' 
  });
});

registerErrorHandlers(app);

const PORT = config.PORT;

app.listen(PORT, () => {
  logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

export default app;
