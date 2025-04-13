const asyncHandler = require('express-async-handler');
const fs = require('fs');
const axios = require('axios');
const { SpeechClient } = require('@google-cloud/speech');

// Set up Google Cloud clients
const speechClient = new SpeechClient();

// LibreTranslate configuration
const libreTranslateEndpoint = process.env.LIBRE_TRANSLATE_ENDPOINT || 'http://localhost:5000';

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
      console.log(`File read from path: ${filePath}, size: ${audioContent.length} bytes`);
    } else if (req.body.audioData) {
      // If audio data was sent directly in the request
      const base64Data = req.body.audioData.replace(/^data:audio\/\w+;base64,/, '');
      audioContent = Buffer.from(base64Data, 'base64');
      console.log(`Base64 data received, size: ${audioContent.length} bytes`);
    }
    
    // Determine audio file encoding and sample rate from request or default values
    const encoding = req.body.encoding || 'WEBM_OPUS';
    const sampleRateHertz = parseInt(req.body.sampleRate) || 48000;
    const languageCode = req.body.languageCode || 'en-US';
    
    console.log(`Processing audio with encoding: ${encoding}, sample rate: ${sampleRateHertz}, language: ${languageCode}`);
    
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
    
    console.log(`Transcription successful: "${transcription.substring(0, 50)}..."`);
    
    res.json({
      success: true,
      text: transcription,
      languageCode,
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ 
      message: error.message, 
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Translate text using self-hosted LibreTranslate
const translateText = asyncHandler(async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Language code mapping
    const languageMap = {
      'English': 'en',
      'Hindi': 'hi',
      'French': 'fr',
      'German': 'de',
      'Spanish': 'es',
      // Add more languages as needed
    };

    const targetLang = languageMap[targetLanguage] || 'en';
    
    // Optional API key for self-hosted LibreTranslate
    const apiKey = process.env.LIBRE_TRANSLATE_API_KEY || '';
    
    // Prepare the request payload
    const payload = {
      q: text,
      source: 'auto',
      target: targetLang,
      format: 'text'
    };
    
    // Add API key if available
    if (apiKey) {
      payload.api_key = apiKey;
    }
    
    const response = await axios.post(
      `${libreTranslateEndpoint}/translate`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('LibreTranslate response:', response.data);

    const translation = response.data?.translatedText || 'Translation unavailable';

    res.json({
      success: true,
      originalText: text,
      translatedText: translation,
      targetLanguage,
      detectedLanguage: response.data?.detectedLanguage?.language || 'unknown'
    });
  } catch (error) {
    console.error('LibreTranslate error:', error.message);
    res.status(500).json({
      message: 'Translation failed using LibreTranslate',
      details: error.message,
    });
  }
});

module.exports = {
  transcribeAudio,
  translateText,
};