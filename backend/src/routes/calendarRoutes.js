const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getEvents, addEvent, deleteEvent } = require('../controllers/calendarController');


router.route('/')
    .get(protect, getEvents)
    .post(protect, authorize('admin'), addEvent);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteEvent);

module.exports = router;