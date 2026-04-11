// backend/src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'GTRAMS_Documents', // Dito mapupunta ang mga pictures sa Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
    }
});

const upload = multer({ storage });

module.exports = upload;