// src/routes/callRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { saveCall, getCalls, getCallAnalytics } = require('../controllers/callController');

const router = express.Router();

router.post('/record', protect, saveCall);
router.get('/', protect, getCalls);
router.get('/analytics', protect, getCallAnalytics);

module.exports = router;
