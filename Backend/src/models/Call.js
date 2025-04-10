// src/models/Call.js
const mongoose = require('mongoose');

const callSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    duration: {
      type: Number, // duration in seconds
      required: true,
    },
    audioUrl: {
      type: String, // URL or path to stored audio file
      required: true,
    },
    transcription: {
      type: String, // Text transcription of the call
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

const Call = mongoose.model('Call', callSchema);

module.exports = Call;