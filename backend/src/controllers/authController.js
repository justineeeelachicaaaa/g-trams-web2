const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Helper function para gumawa ng Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Ma-eexpire ang token in 30 days
    });
};

// @desc    Register a new user (Operator, Admin, o Staff)
// @route   POST /api/v1/auth/register
const registerUser = async (req, res) => {
    try {
        // Kinuha natin ang name at address base sa bagong User model natin
        const { name, address, email, password, role } = req.body;

        // I-check kung may gumagamit na ng email na ito
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // I-save ang bagong user
        const user = await User.create({ name, address, email, password, role });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Authenticate/Login user
// @route   POST /api/v1/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // ginamit natin yung .select('-password') para di isama yung password sa ibabato sa frontend for security
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.address = req.body.address || user.address;
            
            // pag may in-upload na picture galing cloudinary
            if (req.file) {
                user.profilePicUrl = req.file.path;
            }
            
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                address: updatedUser.address,
                profilePicUrl: updatedUser.profilePicUrl
            });
        } else {
            res.status(404).json({ message: 'user not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { registerUser, loginUser, getAllUsers, updateUserProfile };