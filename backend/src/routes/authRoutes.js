const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

// FIX: Pinalitan natin ng 'middleware' (tinanggal ang 's' sa dulo)
const upload = require('../middleware/upload');

const { 
    register, 
    login, 
    getUsers,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyAdminPassword,
    updateUser,          
    deleteUser,
    updateProfile // Kailangan nating i-import din ito dito!
} = require('../controllers/authController');

// PROFILE UPDATE ROUTE (Gumagamit na ng upload middleware)
router.put('/profile', protect, upload.single('profilePic'), updateProfile);

router.post('/register', register);
router.post('/login', login);
router.get('/', protect, getUsers);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);

// --- ADMIN USER MANAGEMENT ROUTES ---
router.post('/verify-password', protect, authorize('admin'), verifyAdminPassword);

router.route('/:id')
    .put(protect, authorize('admin'), updateUser)
    .delete(protect, authorize('admin'), deleteUser);

module.exports = router;