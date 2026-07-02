const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    profileName:{
            type : String,
            trim: true,
            default:username
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
    bannerUrl: {
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
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastSparkCompletedAt: { type: Date, default: null },
    createdAt: {
        type: Date,
        default: Date.now
    },
    organization: { type: String }
});

const User = mongoose.model('User', userSchema);

module.exports = User;