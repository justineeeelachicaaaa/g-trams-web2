const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getEvents, addEvent, deleteEvent } = require('../controllers/calendarController');

// Lahat pwedeng makakita (GET), pero Admin lang pwedeng mag-add at delete (POST, DELETE)
router.route('/')
    .get(protect, getEvents)
    .post(protect, authorize('admin'), addEvent);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteEvent);

module.exports = router;