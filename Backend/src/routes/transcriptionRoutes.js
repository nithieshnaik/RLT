// routes/transcriptionRoutes.js
const express = require('express');
const { transcribeAudio, translateText } = require('../controllers/transcriptionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Route for audio transcription with file upload
router.post('/transcribe', protect, upload.single('audioFile'), transcribeAudio);

// Route for audio transcription with direct audio data
router.post('/transcribe-data', protect, transcribeAudio);

// Route for text translation
router.post('/translate', protect, translateText);

module.exports = router;