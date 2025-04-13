// controllers/transcriptionController.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const fs = require('fs');
const util = require('util');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { SpeechClient } = require('@google-cloud/speech');
const { TranslationServiceClient } = require('@google-cloud/translate');

// Set up Google Cloud clients
const speechClient = new SpeechClient();
const translationClient = new TranslationServiceClient();

// Google Cloud project info
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = 'global';

// Transcribe audio using Google Cloud Speech-to-Text
const transcribeAudio = asyncHandler(async (req, res) => {
  try {
    console.log('transcribeAudio controller called');
    
    if (!req.file && !req.body.audioData) {
      return res.status(400).json({ message: 'No audio file or data provided' });
    }
    
    let audioContent;
    
    if (req.file) {
      // If file was uploaded using multer
      const filePath = req.file.path;
      audioContent = fs.readFileSync(filePath);
    } else if (req.body.audioData) {
      // If audio data was sent directly in the request
      const base64Data = req.body.audioData.replace(/^data:audio\/\w+;base64,/, '');
      audioContent = Buffer.from(base64Data, 'base64');
    }
    
    // Determine audio file encoding and sample rate from request or default values
    const encoding = req.body.encoding || 'WEBM_OPUS';
    const sampleRateHertz = parseInt(req.body.sampleRate) || 48000;
    const languageCode = req.body.languageCode || 'en-US';
    
    // Configure request
    const request = {
      audio: {
        content: audioContent.toString('base64'),
      },
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
        enableAutomaticPunctuation: true,
        model: 'latest_long',
      },
    };
    
    // Detects speech in the audio file
    const [response] = await speechClient.recognize(request);
    
    // Extract transcription from response
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    res.json({
      success: true,
      transcription,
      languageCode,
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ message: error.message });
  }
});

// Translate text using Google Cloud Translation API
const translateText = asyncHandler(async (req, res) => {
  try {
    console.log('translateText controller called');
    
    const { text, targetLanguage, sourceLanguage } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'No text provided for translation' });
    }
    
    if (!targetLanguage) {
      return res.status(400).json({ message: 'Target language is required' });
    }
    
    // Set up the request
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: sourceLanguage || 'en',
      targetLanguageCode: targetLanguage,
    };
    
    // Call the Translation API
    const [response] = await translationClient.translateText(request);
    
    // Extract the translation
    const translation = response.translations[0].translatedText;
    
    res.json({
      success: true,
      originalText: text,
      translatedText: translation,
      sourceLanguage: sourceLanguage || 'en',
      targetLanguage,
    });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  transcribeAudio,
  translateText,
};