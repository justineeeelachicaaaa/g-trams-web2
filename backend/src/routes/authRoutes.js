const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const { 
    register, 
    login, 
    getUsers,
    forgotPassword,
    resetPassword,
    changePassword
} = require('../controllers/authController');

// MGA EXISTING ROUTES
router.post('/register', register);
router.post('/login', login);
router.get('/', protect, getUsers);

// MGA BAGONG ROUTES PARA SA PASSWORD
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);

module.exports = router;