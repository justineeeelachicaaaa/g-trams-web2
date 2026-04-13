const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    status: { type: String, required: true, enum: ['Available', 'E-Sign Mode', 'Unavailable'] },
    note: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Calendar', calendarSchema);