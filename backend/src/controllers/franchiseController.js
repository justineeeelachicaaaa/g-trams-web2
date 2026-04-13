const Franchise = require('../models/franchiseModel');

// 1. ADD NEW FRANCHISE
const createFranchise = async (req, res) => {
    try {
        const { 
            operator, // galing sa admin dropdown
            zone, made, make, motorNo, chassisNo, plateNo, todaName, 
            cedulaDate, cedulaAddress, cedulaSerialNo,
            applicationType, status, dateApplied
        } = req.body;
        
        // kunin secure_url sa cloudinary (kung may in-upload)
        let documentUrl = '';
        if (req.file) {
            documentUrl = req.file.path; 
        }

        const existingTricycle = await Franchise.findOne({ 
            $or: [{ motorNo }, { chassisNo }, { plateNo }] 
        });
        
        if (existingTricycle) {
            return res.status(400).json({ message: 'Tricycle (Plate/Motor/Chassis) is already registered.' });
        }

        // Kung Admin ang nag-add, gagamitin ang pinili niyang 'operator'. 
        // Kung Operator ang nag-apply, gagamitin ang kanyang sariling ID (req.user._id).
        const franchiseOwner = operator || req.user._id;

        let franchise = await Franchise.create({
            operator: franchiseOwner,
            zone, made, make, motorNo, chassisNo, plateNo, todaName,
            cedulaDate, cedulaAddress, cedulaSerialNo,
            applicationType: applicationType || 'New',
            status: status || 'Active',
            dateApplied: dateApplied || Date.now(),
            orCrUrl: documentUrl
        });

        franchise = await franchise.populate('operator', 'name address email');
        res.status(201).json(franchise);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. GET ALL FRANCHISES (Admin)
const getAllFranchises = async (req, res) => {
    try {
        const franchises = await Franchise.find({}).populate('operator', 'name address email');
        res.status(200).json(franchises);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. GET MY FRANCHISES (Operator)
const getMyFranchises = async (req, res) => {
    try {
        const franchises = await Franchise.find({ operator: req.user._id }).populate('operator', 'name address email');
        res.status(200).json(franchises);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. EDIT / UPDATE FULL FRANCHISE (Admin Edit Form)
const updateFranchise = async (req, res) => {
    try {
        const updatedFranchise = await Franchise.findByIdAndUpdate(
            req.params.id,
            req.body, // i-save lahat ng bagong tinype sa form
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

// 5. DELETE FRANCHISE (Admin)
const deleteFranchise = async (req, res) => {
    try {
        const franchise = await Franchise.findByIdAndDelete(req.params.id);
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }
        res.status(200).json({ message: 'Franchise deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. RENEW FRANCHISE
const renewFranchise = async (req, res) => {
    try {
        const { dateApplied, cedulaDate, cedulaAddress, cedulaSerialNo } = req.body;
        
        const updatedFranchise = await Franchise.findByIdAndUpdate(
            req.params.id,
            {
                dateApplied,
                cedulaDate,
                cedulaAddress,
                cedulaSerialNo,
                status: 'Pending',
                applicationType: 'Renewal' 
            },
            { new: true } 
        ).populate('operator', 'name address email');

        if (!updatedFranchise) return res.status(404).json({ message: 'Franchise not found' });
        res.status(200).json(updatedFranchise);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. UPDATE STATUS ONLY (Dashboard Quick Action)
const updateFranchiseStatus = async (req, res) => {
    try {
        const { status, cancelReason } = req.body; 
        
        const updatedFranchise = await Franchise.findByIdAndUpdate(
            req.params.id,
            { status: status, cancelReason: cancelReason || '' },
            { new: true } 
        ).populate('operator', 'name address email');

        if (!updatedFranchise) return res.status(404).json({ message: 'Franchise not found' });
        res.status(200).json(updatedFranchise);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. CANCEL FRANCHISE (Operator)
const cancelMyFranchise = async (req, res) => {
    try {
        const franchise = await Franchise.findById(req.params.id);
        if (!franchise) return res.status(404).json({ message: 'not found' });
        
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
    updateFranchise, 
    deleteFranchise,
    renewFranchise,
    updateFranchiseStatus,
    cancelMyFranchise
};