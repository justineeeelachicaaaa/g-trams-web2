const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');

const { 
    createFranchise, 
    getAllFranchises, 
    getMyFranchises, 
    renewFranchise,
    updateFranchiseStatus,
    cancelMyFranchise 
} = require('../controllers/franchiseController');

const { protect, authorize } = require('../middleware/authMiddleware');

// admin na lang ang may authorize dito
router.get('/', protect, authorize('admin'), getAllFranchises);
router.put('/:id/status', protect, authorize('admin'), updateFranchiseStatus);

router.get('/my-franchises', protect, getMyFranchises);
router.put('/:id/renew', protect, renewFranchise);
router.put('/:id/cancel', protect, cancelMyFranchise);

router.post('/', protect, upload.single('orCrDocument'), createFranchise);

module.exports = router;