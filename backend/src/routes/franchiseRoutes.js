const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

const { 
    createFranchise, 
    getAllFranchises, 
    getMyFranchises, 
    updateFranchise, // NEW
    deleteFranchise, // NEW
    renewFranchise,
    updateFranchiseStatus,
    cancelMyFranchise
} = require('../controllers/franchiseController');

// CREATE & GET ALL
router.route('/')
    .post(protect, upload.single('orCrDocument'), createFranchise)
    .get(protect, getAllFranchises);

// GET MY FRANCHISES (Operator)
router.get('/my-franchises', protect, getMyFranchises);

// UPDATE & DELETE FULL FRANCHISE (Admin Edit & Delete Button)
router.route('/:id')
    .put(protect, updateFranchise)
    .delete(protect, deleteFranchise);

// RENEW FRANCHISE
router.put('/:id/renew', protect, renewFranchise);

// QUICK UPDATE STATUS ONLY
router.put('/:id/status', protect, updateFranchiseStatus);

// CANCEL OWN FRANCHISE
router.put('/:id/cancel', protect, cancelMyFranchise);

module.exports = router;