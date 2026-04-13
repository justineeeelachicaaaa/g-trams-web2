const Report = require('../models/reportModel');

exports.createReport = async (req, res) => {
    try {
        const report = await Report.create({
            operator: req.user._id,
            subject: req.body.subject,
            message: req.body.message
        });
        res.status(201).json(report);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ operator: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().populate('operator', 'name email profilePic').sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.respondToReport = async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { response: req.body.response, status: 'Resolved' },
            { new: true }
        ).populate('operator', 'name email');
        res.status(200).json(report);
    } catch (error) { res.status(500).json({ error: error.message }); }
};