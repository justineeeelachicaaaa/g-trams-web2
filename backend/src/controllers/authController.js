const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail'); // ensure this path is correct

// register
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

// login
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

// get users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
};

// password management functions

// forgot password (sends otp)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Email is not registered.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes valid
        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'G-TRAMS: Password Reset OTP',
                message: `Your OTP to reset your password is: ${otp}\n\nThis is valid for 10 minutes only.`
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

// reset password (using otp and new password)
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ 
            email, 
            otp, 
            otpExpire: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP.' });

        user.password = newPassword; 
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful. You can now login.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// change password (from dashboard settings)
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect old password.' });

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// verify admin password (for security prompt)
exports.verifyAdminPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id); // get logged in admin
        
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Incorrect Admin Password' });
        
        res.status(200).json({ message: 'Password Verified' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// update user details (admin action)
exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).select('-password');
        
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

// delete user (admin action)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { name, address } = req.body;
        
        let updateData = { name, address };

        // if multer captures a file, get cloudinary link
        if (req.file) {
            updateData.profilePic = req.file.path; // automatic cloudinary url
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};