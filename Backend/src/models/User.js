const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      // Only required for regular sign-ups, not for Google login
      required: function() {
        return !this.googleId; 
      }
    },
    password: {
      type: String,
      // Only required for regular sign-ups, not for Google login
      required: function() {
        return !this.googleId; // Only required if there's no googleId
      },
    },
    googleId: {
      type: String,
      default: null,
    },
    profilePicture: {
      type: String,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

// Password encryption middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    next();
    return;
  }
    
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;