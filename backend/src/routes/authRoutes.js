const express = require('express');
const router = express.Router();
// I-import lahat ng functions galing sa controller
const { register, login, verifyEmail, forgotPassword, resetPassword, getUsers } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail); // Bagong route
router.post('/forgot-password', forgotPassword); // Bagong route
router.post('/reset-password', resetPassword); // Bagong route

// Example route para sa getUsers (kung may auth middleware ka, i-add mo na lang)
router.get('/', getUsers); 

module.exports = router;