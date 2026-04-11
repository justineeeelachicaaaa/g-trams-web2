require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const BASE_URI = process.env.BASE_URI || '/api/v1';

// I-import at gamitin ang Auth Routes
const authRoutes = require('./src/routes/authRoutes');
app.use(`${BASE_URI}/auth`, authRoutes);

// IDAGDAG ITO BAGO ANG APP.LISTEN: Ang Franchise Routes
const franchiseRoutes = require('./src/routes/franchiseRoutes');
app.use(`${BASE_URI}/franchises`, franchiseRoutes);

// ISANG BESES LANG DAPAT ITO AT NASA PINAKADULO
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});