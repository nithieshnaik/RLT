// src/routes/homeRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/home', protect, (req, res) => {
  res.json({ 
    message: `Welcome to our project, ${req.user.name}!`,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone
    }
  });
});

module.exports = router;