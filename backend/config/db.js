const mongoose = require('mongoose');

const connectDB = () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_project';
    
    const connectWithRetry = () => {
        console.log('Attempting to connect to MongoDB...');
        mongoose.connect(mongoURI)
            .then(() => {
                console.log(`Connected to MongoDB successfully! Database location: ${mongoURI.includes('mongodb+srv') ? 'Atlas Cloud' : 'Local Host'}`);
            })
            .catch((err) => {
                console.error("Mongo Connection error:", err.message);
                console.log("Retrying connection in 5 seconds...");
                setTimeout(connectWithRetry, 5000);
            });
    };

    connectWithRetry();
};

module.exports = connectDB;
