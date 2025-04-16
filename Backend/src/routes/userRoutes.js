const express = require('express');
const { authUser, registerUser, getUserProfile ,googleLogin } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');


const router = express.Router();

router.post('/login', authUser);
router.post('/', registerUser);
router.get('/profile', protect, getUserProfile);
router.post('/google-login', googleLogin);
 
module.exports = router;