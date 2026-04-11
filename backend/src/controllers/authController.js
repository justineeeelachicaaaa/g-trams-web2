const User = require('../models/userModel');
const bcrypt = require('bcryptjs'); // o 'bcrypt', depende sa gamit mo
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail'); // I-import ang mailer

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, address, email, password, role } = req.body;

        // Check kung may user na
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

        // Create user (pero isVerified: false pa)
        user = new User({
            name, address, email, role,
            password: hashedPassword,
            otp, otpExpire
        });

        await user.save();

        // Send OTP via Email
        const message = `Hello ${name},\n\nWelcome to G-TRAMS!\n\nYour verification code is: ${otp}\n\nThis code is valid for 10 minutes.\n\nThank you!`;
        
        await sendEmail({
            email: user.email,
            subject: 'G-TRAMS - Email Verification Code',
            message: message
        });

        res.status(200).json({ message: 'OTP sent to your email. Please verify.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// VERIFY EMAIL (Bagong Function)
exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        if (user.otp !== otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Kung tama ang OTP
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        // Bigyan na ng token para makapasok
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: 'Email verified successfully', token, role: user.role });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

// LOGIN (Update: Dapat bawal pumasok pag hindi pa verified)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // I-check kung verified na
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email first', notVerified: true });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ token, role: user.role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// FORGOT PASSWORD (Bagong Function)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        const message = `You requested a password reset.\n\nYour reset code is: ${otp}\n\nIf you did not request this, please ignore this email.`;
        await sendEmail({ email: user.email, subject: 'G-TRAMS - Password Reset Code', message });

        res.status(200).json({ message: 'Reset code sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// RESET PASSWORD (Bagong Function)
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful. You can now login.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET ALL USERS (Kunin mo kung anong existing code mo para sa pagkuha ng users, halimbawa:)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};