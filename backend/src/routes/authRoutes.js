const express = require('express');
const router = express.Router();

// Siguraduhin na ang mga ito lang ang naka-import
const { 
    register, 
    login, 
    getUsers 
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/', getUsers);

module.exports = router;