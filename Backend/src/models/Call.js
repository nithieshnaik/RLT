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
    holdDuration: {
      type: Number, // hold duration in seconds
      default: 0,
    },
    audioUrl: {
      type: String, // URL or path to stored audio file
      required: true,
    },
    transcription: {
      type: String, // Text transcription of the call
      required: false,
    },
    sentiment: {
      positive: {
        type: Number,
        default: 0
      },
      neutral: {
        type: Number,
        default: 0 
      },
      negative: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true,
  }
);

const Call = mongoose.model('Call', callSchema);

module.exports = Call;