// src/controllers/callController.js
const Call = require('../models/Call');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

// @desc    Save a new voice recording
// @route   POST /api/calls/record
// @access  Private
const saveCall = async (req, res) => {
  try {
    const { audioData, duration, transcription } = req.body;
    
    if (!audioData || !duration) {
      return res.status(400).json({ message: 'Audio data and duration are required' });
    }

    // Remove the data URL prefix to get the base64 data
    const base64Data = audioData.replace(/^data:audio\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create a unique filename
    const filename = `call_${req.user._id}_${Date.now()}.webm`;
    const filepath = path.join(__dirname, '../../uploads/calls', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the file
    await writeFile(filepath, buffer);
    
    // Save call data to database
    const call = await Call.create({
      user: req.user._id,
      duration,
      audioUrl: `/uploads/calls/${filename}`,
      transcription: transcription || '',
    });

    res.status(201).json({
      _id: call._id,
      duration: call.duration,
      audioUrl: call.audioUrl,
      transcription: call.transcription,
      timestamp: call.timestamp,
    });
  } catch (error) {
    console.error('Error saving call:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all calls for a user
// @route   GET /api/calls
// @access  Private
const getCalls = async (req, res) => {
  try {
    const calls = await Call.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.json(calls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get call analytics
// @route   GET /api/calls/analytics
// @access  Private
const getCallAnalytics = async (req, res) => {
  try {
    const calls = await Call.find({ user: req.user._id });
    
    // Calculate total calls
    const totalCalls = calls.length;
    
    // Calculate total duration
    const totalDuration = calls.reduce((sum, call) => sum + call.duration, 0);
    
    // Group calls by day for trend analysis
    const callsByDay = {};
    calls.forEach(call => {
      const date = call.createdAt.toISOString().split('T')[0];
      if (!callsByDay[date]) {
        callsByDay[date] = {
          count: 0,
          totalDuration: 0
        };
      }
      callsByDay[date].count += 1;
      callsByDay[date].totalDuration += call.duration;
    });
    
    // Convert to array for easier frontend processing
    const callTrends = Object.keys(callsByDay).map(date => ({
      date,
      count: callsByDay[date].count,
      totalDuration: callsByDay[date].totalDuration
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({
      totalCalls,
      totalDuration,
      averageCallDuration: totalCalls > 0 ? totalDuration / totalCalls : 0,
      callTrends
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { saveCall, getCalls, getCallAnalytics };