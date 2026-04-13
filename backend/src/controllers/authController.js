const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail'); // Siguraduhing tama ang path nito

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, address, email, password, role } = req.body;
        
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Email already registered' });

        user = new User({ 
            name, 
            address, 
            email, 
            password, 
            role: role || 'operator', 
            isVerified: true 
        });

        await user.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error("Registration Error:", error);
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
        res.status(500).json({ message: 'Error' });
    }
};

// --- MGA BAGONG FUNCTIONS PARA SA PASSWORD ---

// FORGOT PASSWORD (Magse-send ng OTP)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Hindi nakarehistro ang email na ito.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes valid
        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'G-TRAMS: Password Reset OTP',
                message: `Ang iyong OTP para ma-reset ang password ay: ${otp}\n\nValid lamang ito ng 10 minuto.`
            });
            res.status(200).json({ message: 'OTP sent to email successfully.' });
        } catch (err) {
            user.otp = undefined;
            user.otpExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Error sending email. Check your email credentials.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// RESET PASSWORD (Gamit ang OTP at Bagong Password)
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ 
            email, 
            otp, 
            otpExpire: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ message: 'Invalid o expired na ang OTP.' });

        user.password = newPassword; 
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful. Pwede ka na mag-login.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// CHANGE PASSWORD (Sa loob ng Dashboard / Settings)
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) return res.status(400).json({ message: 'Mali ang iyong lumang password.' });

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};