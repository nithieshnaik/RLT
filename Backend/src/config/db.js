// src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Add this code to drop the phone index
    try {
      await mongoose.connection.collection('users').dropIndex('phone_1');
      console.log('Successfully dropped phone index');
    } catch (err) {
      console.log('No phone index to drop or already dropped');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;