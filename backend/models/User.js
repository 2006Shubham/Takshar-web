const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: String,
        required: false,
        trim: true,
        default: 'Spark Challenger' // Safely defaults if not provided during signup
    },
    profileUrl: {
        type: String,
        // Sets a clean, standard default avatar URL if the user doesn't upload one
        default: 'https://i.pravatar.cc/150?u=spark-default'
    },
    password: {
        type: String,
        required: true
    },
    peers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;