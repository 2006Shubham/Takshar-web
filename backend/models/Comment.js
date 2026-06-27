const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({

    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
    },

    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },

    commenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text:
    {
        type: String,
        required: true
    },

    likes: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'


    }],



    createdAt: {
        type: Date,
        default: Date.now
    }
})

commentSchema.index({ parentId: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;