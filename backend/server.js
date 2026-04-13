require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const app = express();
connectDB();

// configure cors for the deployed vercel frontend and local development
app.use(cors({
    origin: [
        'https://g-trams-web2.vercel.app',
        'http://localhost:5173'
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const BASE_URI = process.env.BASE_URI || '/api/v1';

// auth routes
const authRoutes = require('./src/routes/authRoutes');
app.use(`${BASE_URI}/auth`, authRoutes);

// franchise routes
const franchiseRoutes = require('./src/routes/franchiseRoutes');
app.use(`${BASE_URI}/franchises`, franchiseRoutes);

// calendar and report routes
app.use(`${BASE_URI}/calendar`, require('./src/routes/calendarRoutes'));
app.use(`${BASE_URI}/reports`, require('./src/routes/reportRoutes'));

// server initialization
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});