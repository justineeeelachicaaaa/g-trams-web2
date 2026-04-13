const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createReport, getMyReports, getAllReports, respondToReport } = require('../controllers/reportController');

router.post('/', protect, createReport);
router.get('/my-reports', protect, getMyReports);
router.get('/', protect, authorize('admin'), getAllReports);
router.put('/:id/respond', protect, authorize('admin'), respondToReport);

module.exports = router;