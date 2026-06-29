const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
if (!process.env.JWT_SECRET) {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Express App setup
const app = express();
app.use(cookieParser());
app.use(express.json());

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173', // Vite development server
    'http://localhost:8080', // Production container port (old)
    'http://localhost:8081'  // Production container port (new)
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Route Definitions
const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);

// Server Listening
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});