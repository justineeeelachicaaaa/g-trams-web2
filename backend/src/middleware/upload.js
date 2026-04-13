const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Dahil may Cloudinary ka na, malamang nasa .env na itong mga ito:
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Ito ang magiging tulay: Multer -> Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'gtrams_profiles', // Gagawa si Cloudinary ng folder na ganito
        allowed_formats: ['jpg', 'png', 'jpeg'] // Images lang tatanggapin
    }
});

const upload = multer({ storage: storage });

module.exports = upload;