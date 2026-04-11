const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'] 
    },
    address: {
        type: String,
        required: [true, 'Please provide an address'] 
    },
    profilePicUrl: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['operator', 'admin'], // inalis na ang staff dito
        default: 'operator'
    }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);