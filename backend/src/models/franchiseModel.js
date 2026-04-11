const mongoose = require('mongoose');

const franchiseSchema = new mongoose.Schema({
    operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    zone: { type: String, required: true },
    made: { type: String, required: true },
    make: { type: String, required: true },
    motorNo: { type: String, required: true, unique: true },
    chassisNo: { type: String, required: true, unique: true },
    plateNo: { type: String, required: true, unique: true },
    todaName: { type: String, required: true },
    orCrUrl: { type: String }, 
   
    dateApplied: { 
        type: Date, 
        default: Date.now 
    },
    taxIdSedula: {
        dateKinuha: { type: Date, required: true },
        address: { type: String, required: true }, 
        serialNo: { type: String, required: true }
    },

    status: {
        type: String,
        enum: ['Pending', 'Active', 'Expired', 'Cancelled'],
        default: 'Pending'
    },
    
    // nilabas ko dito para di mag-error ang database
    applicationType: { type: String, default: 'New' },
    cancelReason: { type: String, default: '' },       
            
    issueDate: { type: Date },
    expiryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Franchise', franchiseSchema);