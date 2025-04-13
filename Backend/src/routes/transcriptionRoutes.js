const express = require('express');
const { transcribeAudio, translateText } = require('../controllers/transcriptionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Create router
const router = express.Router();

// Add a simple test route
router.get('/status', (req, res) => {
  res.json({ status: 'Transcription routes loaded successfully' });
});

// Route for audio transcription with file upload
router.post('/transcribe', protect, upload.single('audioFile'), transcribeAudio);

// Route for audio transcription with direct audio data
router.post('/transcribe-data', protect, transcribeAudio);

// Route for text translation - make sure this matches exactly what's expected in frontend
router.post('/translate', protect, translateText);

module.exports = router;