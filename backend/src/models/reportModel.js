const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    response: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);