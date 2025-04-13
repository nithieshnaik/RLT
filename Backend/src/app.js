const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan'); // For logging HTTP requests

// Import routes
let userRoutes, homeRoutes, callRoutes, transcriptionRoutes;

try {
  userRoutes = require('./routes/userRoutes');
  console.log('User routes loaded successfully');
} catch (error) {
  console.error('Error loading user routes:', error);
  const router = express.Router();
  router.get('/', (req, res) => res.status(500).json({ error: 'User routes not available' }));
  userRoutes = router;
}

try {
  homeRoutes = require('./routes/homeRoutes');
  console.log('Home routes loaded successfully');
} catch (error) {
  console.error('Error loading home routes:', error);
  const router = express.Router();
  router.get('/', (req, res) => res.status(500).json({ error: 'Home routes not available' }));
  homeRoutes = router;
}

try {
  callRoutes = require('./routes/callRoutes');
  console.log('Call routes loaded successfully');
} catch (error) {
  console.error('Error loading call routes:', error);
  const router = express.Router();
  router.get('/', (req, res) => res.status(500).json({ error: 'Call routes not available' }));
  callRoutes = router;
}

try {
  // Explicit path to ensure correct loading
  transcriptionRoutes = require('./routes/transcriptionRoutes');
  console.log('Transcription routes loaded successfully');
} catch (error) {
  console.error('Error loading transcription routes:', error);
  console.error('Detailed error:', error.stack);
  const router = express.Router();
  router.get('/', (req, res) => res.status(500).json({ error: 'Transcription routes not available' }));
  router.post('/transcribe', (req, res) => res.status(500).json({ error: 'Transcription endpoint not available', details: error.message }));
  router.post('/translate', (req, res) => res.status(500).json({ error: 'Translation endpoint not available', details: error.message }));
  transcriptionRoutes = router;
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for audio files
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api', homeRoutes);
app.use('/api/calls', callRoutes);

// Explicitly register transcription routes
console.log('Registering transcription routes at /api/transcription');
app.use('/api/transcription', transcriptionRoutes);

// Add a test route for transcription to verify it's working
app.get('/api/test-transcription', (req, res) => {
  res.json({ 
    status: 'Transcription routes test endpoint', 
    message: 'If you see this, the server is working correctly',
    routesLoaded: !!transcriptionRoutes
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling for 404 - Route not found
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// General error handler
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

module.exports = app;