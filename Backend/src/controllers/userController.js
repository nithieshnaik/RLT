// controllers/userController.js
const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = "521647966541-bpamcibjkjfdekv3f4pfjadn6a320r42.apps.googleusercontent.com"; // Use the same CLIENT_ID from your frontend
const client = new OAuth2Client(CLIENT_ID);

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Add a new controller for Google login
const googleLogin = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google token properly
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user's Google ID if needed
      if (!user.googleId) {
        user.googleId = sub;
        user.profilePicture = picture || user.profilePicture;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId: sub,
        profilePicture: picture,
        phone: '', // Phone is optional for Google login
      });
    }
    
    // Generate JWT token
    const jwtToken = generateToken(user._id);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      profilePicture: user.profilePicture,
      token: jwtToken,
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
});

module.exports = { authUser, registerUser, getUserProfile ,  googleLogin };