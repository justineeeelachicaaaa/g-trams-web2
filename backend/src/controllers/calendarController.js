const Calendar = require('../models/calendarModel');

exports.getEvents = async (req, res) => {
    try {
        // I-sort mula sa pinaka-recent na petsa
        const events = await Calendar.find().sort({ date: 1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addEvent = async (req, res) => {
    try {
        const { date, status, note } = req.body;
        const newEvent = await Calendar.create({ date, status, note });
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error adding event' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        await Calendar.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event' });
    }
};