const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, address, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Email already registered' });

        // Default verified para makapag-login agad ang bagong admin
        user = new User({ 
            name, 
            address, 
            email, 
            password, 
            role, 
            isVerified: true 
        });
        await user.save();

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Login error' });
    }
};

// GET USERS
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};