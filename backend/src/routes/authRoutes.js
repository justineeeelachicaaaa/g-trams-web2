const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary'); 

const { registerUser, loginUser, getAllUsers, updateUserProfile } = require('../controllers/authController'); 
const { protect } = require('../middleware/authMiddleware'); 

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, getAllUsers); 

// bagong route para sa profile edit (may picture upload)
router.put('/profile', protect, upload.single('profilePic'), updateUserProfile);

module.exports = router;