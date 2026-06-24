const mongoose = require('mongoose');

const sparkSchema = new mongoose.Schema({


    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    to: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    topic: {
        type: String,
        required: true
    }
    ,
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined', 'Completed'],
        default: 'Pending'
    },

    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'video',
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Spark = mongoose.model('Spark', sparkSchema);
module.exports = Spark;