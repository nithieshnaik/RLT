const fs = require('fs');
const Call = require('../models/Call');

const saveCall = async (req, res) => {
  try {
    console.log('saveCall controller called');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Handle either FormData with file or JSON with audio data
    let audioData, duration, transcription, holdDuration = 0;
    let audioUrl = '';
    
    if (req.file) {
      // If using multer middleware for file upload
      const filePath = req.file.path;
      audioData = fs.readFileSync(filePath);
      // Extract duration from request or set default
      duration = parseInt(req.body.duration) || 60;
      transcription = req.body.transcription || '';
      holdDuration = parseInt(req.body.holdDuration) || 0;
      // Save the path to the file as URL
      audioUrl = `/uploads/calls/${req.file.filename}`;
    } else if (req.body.audioData) {
      // If sending audio data directly in request body
      const base64Data = req.body.audioData.replace(/^data:audio\/\w+;base64,/, '');
      audioData = Buffer.from(base64Data, 'base64');
      duration = parseInt(req.body.duration) || 60;
      transcription = req.body.transcription || '';
      holdDuration = parseInt(req.body.holdDuration) || 0;
      
      // Create a file from the audio data
      const filename = `call_${req.user._id}_${Date.now()}.webm`;
      const filePath = `uploads/calls/${filename}`;
      
      // Ensure directory exists
      const dir = 'uploads/calls';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write the file
      fs.writeFileSync(filePath, audioData);
      audioUrl = `/${filePath}`;
    } else {
      return res.status(400).json({ message: 'No audio data provided' });
    }
    
    // Create sentiment data (you may want to analyze the audio/transcription to get real sentiment)
    const sentimentData = {
      positive: Math.floor(Math.random() * 60) + 20, // Random value between 20-80
      neutral: Math.floor(Math.random() * 50), // Random value between 0-50
      negative: Math.floor(Math.random() * 30) // Random value between 0-30
    };
    
    // Ensure total is 100%
    const totalSentiment = sentimentData.positive + sentimentData.neutral + sentimentData.negative;
    if (totalSentiment !== 100) {
      const diff = 100 - totalSentiment;
      sentimentData.neutral += diff;
    }
    
    // Create a new call record in the database
    const newCall = new Call({
      user: req.user._id,
      duration: duration,
      holdDuration: holdDuration,
      audioUrl: audioUrl,
      transcription: transcription,
      sentiment: {
        positive: sentimentData.positive,
        neutral: sentimentData.neutral,
        negative: sentimentData.negative
      }
    });
    
    const savedCall = await newCall.save();
    
    res.status(201).json({
      message: 'Call saved successfully',
      call: savedCall
    });
  } catch (error) {
    console.error('Error saving call:', error);
    res.status(500).json({ message: error.message });
  }
};

const getCalls = async (req, res) => {
  try {
    console.log('getCalls controller called, user ID:', req.user._id);
    const calls = await Call.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.json(calls);
  } catch (error) {
    console.error('Error getting calls:', error);
    res.status(500).json({ message: error.message });
  }
};

const getCallAnalytics = async (req, res) => {
  try {
    console.log('getCallAnalytics controller called, user ID:', req.user._id);
    
    // Parse date filter parameters
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to last 7 days
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // Set time to beginning/end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    console.log(`Fetching calls between ${startDate.toISOString()} and ${endDate.toISOString()}`);
    
    // Query calls within date range
    const calls = await Call.find({
      user: req.user._id,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });
    
    // Calculate total calls
    const totalCalls = calls.length;
    console.log(`Found ${totalCalls} calls in date range`);
    
    // Calculate total and average durations
    let totalDuration = 0;
    calls.forEach(call => {
      totalDuration += call.duration;
    });
    
    // Calculate sentiment data aggregates
    const sentimentData = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    
    // Process sentiment data from all calls
    calls.forEach(call => {
      if (call.sentiment) {
        sentimentData.positive += call.sentiment.positive || 0;
        sentimentData.neutral += call.sentiment.neutral || 0;
        sentimentData.negative += call.sentiment.negative || 0;
      }
    });
    
    // Convert to percentages
    const totalSentiment = sentimentData.positive + sentimentData.neutral + sentimentData.negative;
    if (totalSentiment > 0) {
      sentimentData.positive = Math.round((sentimentData.positive / totalSentiment) * 100);
      sentimentData.neutral = Math.round((sentimentData.neutral / totalSentiment) * 100);
      sentimentData.negative = Math.round((sentimentData.negative / totalSentiment) * 100);
      
      // Handle rounding errors to ensure total is 100%
      const total = sentimentData.positive + sentimentData.neutral + sentimentData.negative;
      if (total !== 100) {
        sentimentData.neutral += (100 - total);
      }
    } else {
      // Default values if no sentiment data
      sentimentData.positive = 60;
      sentimentData.neutral = 25;
      sentimentData.negative = 15;
    }
    
    // Calculate NPS score based on sentiment (example calculation)
    const npsScore = Math.min(100, Math.max(0, Math.round(
      ((sentimentData.positive - sentimentData.negative) / 100) * 100
    )));
    
    // Generate daily sentiment trends
    const sentimentTrends = [];
    
    // Determine the appropriate time interval based on date range
    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    let interval = 'day';
    
    if (diffDays > 90) {
      interval = 'month';
    } else if (diffDays > 30) {
      interval = 'week';
    }
    
    // Generate trend data points based on interval
    if (interval === 'day') {
      // Daily data points
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayStart = new Date(d);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayCalls = calls.filter(call => 
          call.createdAt >= dayStart && call.createdAt <= dayEnd
        );
        
        const dayData = {
          date: dayStart.toISOString().split('T')[0],
          positive: 0,
          neutral: 0,
          negative: 0
        };
        
        if (dayCalls.length > 0) {
          let posTotal = 0, neutTotal = 0, negTotal = 0;
          
          dayCalls.forEach(call => {
            if (call.sentiment) {
              posTotal += call.sentiment.positive || 0;
              neutTotal += call.sentiment.neutral || 0;
              negTotal += call.sentiment.negative || 0;
            }
          });
          
          const total = posTotal + neutTotal + negTotal;
          if (total > 0) {
            dayData.positive = Math.round((posTotal / total) * 100);
            dayData.neutral = Math.round((neutTotal / total) * 100);
            dayData.negative = Math.round((negTotal / total) * 100);
            
            // Fix rounding errors
            const dayTotal = dayData.positive + dayData.neutral + dayData.negative;
            if (dayTotal !== 100) {
              dayData.neutral += (100 - dayTotal);
            }
          } else {
            // Default values if no sentiment data for this day
            dayData.positive = 60;
            dayData.neutral = 25;
            dayData.negative = 15;
          }
        } else {
          // No calls this day, use default or previous day's data
          if (sentimentTrends.length > 0) {
            const prev = sentimentTrends[sentimentTrends.length - 1];
            dayData.positive = prev.positive;
            dayData.neutral = prev.neutral;
            dayData.negative = prev.negative;
          } else {
            dayData.positive = 60;
            dayData.neutral = 25;
            dayData.negative = 15;
          }
        }
        
        sentimentTrends.push(dayData);
      }
    } else if (interval === 'week') {
      // Weekly data points
      let weekStart = new Date(startDate);
      while (weekStart <= endDate) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());
        
        const weekCalls = calls.filter(call => 
          call.createdAt >= weekStart && call.createdAt <= weekEnd
        );
        
        const weekData = {
          date: `${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`,
          positive: 0,
          neutral: 0,
          negative: 0
        };
        
        // Calculate sentiment for the week
        if (weekCalls.length > 0) {
          let posTotal = 0, neutTotal = 0, negTotal = 0;
          
          weekCalls.forEach(call => {
            if (call.sentiment) {
              posTotal += call.sentiment.positive || 0;
              neutTotal += call.sentiment.neutral || 0;
              negTotal += call.sentiment.negative || 0;
            }
          });
          
          const total = posTotal + neutTotal + negTotal;
          if (total > 0) {
            weekData.positive = Math.round((posTotal / total) * 100);
            weekData.neutral = Math.round((neutTotal / total) * 100);
            weekData.negative = Math.round((negTotal / total) * 100);
            
            // Fix rounding errors
            const weekTotal = weekData.positive + weekData.neutral + weekData.negative;
            if (weekTotal !== 100) {
              weekData.neutral += (100 - weekTotal);
            }
          } else {
            // Default values if no sentiment data for this week
            weekData.positive = 60;
            weekData.neutral = 25;
            weekData.negative = 15;
          }
        } else {
          // No calls this week, use default or previous week's data
          if (sentimentTrends.length > 0) {
            const prev = sentimentTrends[sentimentTrends.length - 1];
            weekData.positive = prev.positive;
            weekData.neutral = prev.neutral;
            weekData.negative = prev.negative;
          } else {
            weekData.positive = 60;
            weekData.neutral = 25;
            weekData.negative = 15;
          }
        }
        
        sentimentTrends.push(weekData);
        weekStart.setDate(weekStart.getDate() + 7);
      }
    } else {
      // Monthly data points - similar logic can be implemented here
    }
    
    // Calculate call volume trends
    const callTrends = [];
    for (let i = 0; i < Math.min(diffDays, 30); i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const dailyCalls = calls.filter(call => 
        call.createdAt >= startOfDay && call.createdAt <= endOfDay
      );
      
      callTrends.unshift({
        date: startOfDay.toISOString().split('T')[0],
        count: dailyCalls.length,
        avgDuration: dailyCalls.length > 0 
          ? Math.round(dailyCalls.reduce((sum, call) => sum + call.duration, 0) / dailyCalls.length / 60) // Convert to minutes
          : 0
      });
    }
    
    // Calculate month-over-month change
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const currentMonthCalls = calls.filter(call => 
      new Date(call.createdAt).getMonth() === currentMonth
    );
    
    const lastMonthCalls = calls.filter(call => 
      new Date(call.createdAt).getMonth() === lastMonth
    );
    
    const changePercentage = lastMonthCalls.length > 0 
      ? Math.round(((currentMonthCalls.length - lastMonthCalls.length) / lastMonthCalls.length) * 100) 
      : 100;
    
    res.json({
      totalCalls,
      totalDuration,
      averageCallDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls / 60) : 0, // Convert to minutes
      changePercentage,
      sentimentData,
      npsScore: Math.max(0, Math.min(100, npsScore || 42)), // Ensure between 0-100
      calls: calls.slice(0, 10), // Return recent calls
      callTrends,
      sentimentTrends
    });
  } catch (error) {
    console.error('Error getting call analytics:', error);
    res.status(500).json({ message: error.message });
  }
};

// Make sure all three functions are explicitly exported
module.exports = { 
  saveCall, 
  getCalls, 
  getCallAnalytics 
};