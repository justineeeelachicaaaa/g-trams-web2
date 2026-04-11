const Franchise = require('../models/franchiseModel');

// apply for a new franchise
const createFranchise = async (req, res) => {
    try {
        const { zone, made, make, motorNo, chassisNo, plateNo, todaName, taxIdSedula } = req.body;
        
        // kunin secure_url sa cloudinary
        let documentUrl = '';
        if (req.file) {
            documentUrl = req.file.path; 
        }

        const existingTricycle = await Franchise.findOne({ 
            $or: [{ motorNo }, { chassisNo }, { plateNo }] 
        });
        
        if (existingTricycle) {
            return res.status(400).json({ message: 'Tricycle is already registered.' });
        }

        let franchise = await Franchise.create({
            operator: req.user._id,
            zone, made, make, motorNo, chassisNo, plateNo, todaName,
            orCrUrl: documentUrl, // save link dito
            taxIdSedula: typeof taxIdSedula === 'string' ? JSON.parse(taxIdSedula) : taxIdSedula 
        });

        franchise = await franchise.populate('operator', 'name address email');
        res.status(201).json(franchise);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// get all franchises sa admin
const getAllFranchises = async (req, res) => {
    try {
        const franchises = await Franchise.find({}).populate('operator', 'name address email');
        res.status(200).json(franchises);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// get user franchises
const getMyFranchises = async (req, res) => {
    try {
        const franchises = await Franchise.find({ operator: req.user._id });
        res.status(200).json(franchises);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// renew
const renewFranchise = async (req, res) => {
    try {
        const { dateApplied, taxIdSedula } = req.body;
        
        const updatedFranchise = await Franchise.findByIdAndUpdate(
            req.params.id,
            {
                dateApplied: dateApplied,
                taxIdSedula: taxIdSedula,
                status: 'Pending',
                applicationType: 'Renewal' 
            },
            { new: true } 
        );

        if (!updatedFranchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }

        res.status(200).json(updatedFranchise);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// update status 
const updateFranchiseStatus = async (req, res) => {
    try {
        const { status, cancelReason } = req.body; // dinagdag dito yung cancelReason
        
        const updatedFranchise = await Franchise.findByIdAndUpdate(
            req.params.id,
            { 
                status: status,
                cancelReason: cancelReason || '' // pinasok sa loob ng bracket
            },
            { new: true } 
        ).populate('operator', 'name address email');

        if (!updatedFranchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }

        res.status(200).json(updatedFranchise);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const cancelMyFranchise = async (req, res) => {
    try {
        const franchise = await Franchise.findById(req.params.id);
        if (!franchise) return res.status(404).json({ message: 'not found' });
        
        // check kung siya ba talaga may ari nung prangkisa
        if (franchise.operator.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'not authorized' });
        }
        
        franchise.status = 'Cancelled';
        franchise.cancelReason = req.body.cancelReason || 'kinansela ng operator';
        await franchise.save();
        
        res.status(200).json(franchise);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { 
    createFranchise, 
    getAllFranchises, 
    getMyFranchises, 
    renewFranchise,
    updateFranchiseStatus,
    cancelMyFranchise
};