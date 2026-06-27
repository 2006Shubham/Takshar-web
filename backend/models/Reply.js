const mongoose = require('mongoose')

const replySchema = new mongoose.Schema({

    parentType: {
        type: String,
        enum: ['Comment', 'Reply'],
        required: true
    },

    parentId: { type: mongoose.Schema.Types.ObjectId, required: true },


    replier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    text: {
        type: String, required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }],
    createdAt: {
        type: Date, default: Date.now
    }


});