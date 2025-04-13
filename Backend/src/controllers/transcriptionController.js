const asyncHandler = require('express-async-handler');
const fs = require('fs');
const axios = require('axios');
const { SpeechClient } = require('@google-cloud/speech');

// Set up Google Cloud clients
const speechClient = new SpeechClient();

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

// Translate text using MyMemory API (free, no API key required)
const translateText = asyncHandler(async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'English' } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Language code mapping
    const languageMap = {
      'English': 'en',
      'Hindi': 'hi',
      'Punjabi': 'pa',
      'Haryanvi': 'hi', // No specific code, closest is Hindi
      'Bhojpuri': 'bho',
      'Maithli': 'mai',
      'Odia': 'or',
      'Bengali': 'bn',
      'Gujarati': 'gu', 
      'Tamil': 'ta',
      'Telugu': 'te',
      'Kannada': 'kn', 
      'Malayalam': 'ml',
      'Marathi': 'mr',
      'Urdu': 'ur',
      
      // Add more languages as needed
    };

    const sourceLang = languageMap[sourceLanguage] || 'en';
    const targetLang = languageMap[targetLanguage] || 'hi';
    
    console.log(`Translating from ${sourceLang} to ${targetLang}`);
    
    // Call MyMemory API - completely free for limited usage
    const response = await axios.get(
      `https://api.mymemory.translated.net/get`,
      {
        params: {
          q: text,
          langpair: `${sourceLang}|${targetLang}`,
          de: 'your@email.com', // Add your email for slightly higher usage limits
        }
      }
    );

    console.log('MyMemory API response:', response.data);

    const translatedText = response.data?.responseData?.translatedText || 'Translation unavailable';

    // For languages with limited support, we might need a fallback
    if (translatedText === text && sourceLang !== targetLang) {
      console.log(`Direct translation failed, attempting two-step translation via English`);
      
      // If direct translation fails, try translating via English
      if (sourceLang !== 'en') {
        const toEnglishResponse = await axios.get(
          `https://api.mymemory.translated.net/get`,
          {
            params: {
              q: text,
              langpair: `${sourceLang}|en`,
              de: 'your@email.com',
            }
          }
        );
        
        const englishText = toEnglishResponse.data?.responseData?.translatedText || text;
        
        const fromEnglishResponse = await axios.get(
          `https://api.mymemory.translated.net/get`,
          {
            params: {
              q: englishText,
              langpair: `en|${targetLang}`,
              de: 'your@email.com',
            }
          }
        );
        
        const finalTranslation = fromEnglishResponse.data?.responseData?.translatedText || 'Translation unavailable';
        
        res.json({
          success: true,
          originalText: text,
          translatedText: finalTranslation,
          targetLanguage,
          note: 'Used two-step translation via English'
        });
        return;
      }
    }

    res.json({
      success: true,
      originalText: text,
      translatedText: translatedText,
      targetLanguage,
    });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({
      message: 'Translation failed',
      details: error.message,
    });
  }
});

module.exports = {
  transcribeAudio,
  translateText,
};