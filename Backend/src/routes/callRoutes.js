// src/routes/callRoutes.js
const express = require('express');
const { saveCall, getCalls, getCallAnalytics } = require('../controllers/callController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Check if saveCall is defined and is a function
if (typeof saveCall !== 'function') {
  console.error('saveCall is not a function or is undefined', saveCall);
  // Provide a placeholder function if saveCall is undefined
  const placeholderFunction = (req, res) => {
    res.status(500).json({ message: 'Controller function not properly defined' });
  };
  
  // Route for file upload approach - with placeholder if needed
  router.post('/record', protect, upload.single('audioFile'), 
    typeof saveCall === 'function' ? saveCall : placeholderFunction
  );
  
  // Alternative route that accepts JSON body with base64 audio data
  router.post('/record-data', protect, 
    typeof saveCall === 'function' ? saveCall : placeholderFunction
  );
} else {
  // Normal route definition if saveCall is properly defined
  router.post('/record', protect, upload.single('audioFile'), saveCall);
  router.post('/record-data', protect, saveCall);
}

// These routes should be fine if getCalls and getCallAnalytics are defined
if (typeof getCalls === 'function') {
  router.get('/', protect, getCalls);
} else {
  console.error('getCalls is not a function or is undefined');
  router.get('/', protect, (req, res) => {
    res.status(500).json({ message: 'Get calls function not properly defined' });
  });
}

if (typeof getCallAnalytics === 'function') {
  router.get('/analytics', protect, getCallAnalytics);
} else {
  console.error('getCallAnalytics is not a function or is undefined');
  router.get('/analytics', protect, (req, res) => {
    res.status(500).json({ message: 'Get call analytics function not properly defined' });
  });
}

module.exports = router;