const Comment = require('../models/Comment');

// @desc    Post a comment on a feed video
// @route   POST /api/postcomment
// @access  Private
const postComment = async (req, res) => {
    try {
        const { text, videoId, parentId } = req.body;
        const userId = req.user._id;
        
        let newComment = new Comment({
            text,
            videoId: parentId ? null : videoId, // Keep videoId null if it's a reply
            parentId: parentId || null,         // Keep parentId null if it's a main comment
            commenter: userId
        });

        const savedComment = await newComment.save();
        newComment = await Comment.findById(newComment._id).populate('commenter', 'username profileUrl');

        res.status(201).json(newComment);
    } catch (error) {
        console.error("Error posting comment:", error);
        res.status(500).json({ error: "Failed to post comment" });
    }
};

// @desc    Fetch comments for a video
// @route   GET /api/fetchcomments
// @access  Private
const fetchComments = async (req, res) => {
    try {
        const { videoId } = req.query;
        const userId = req.user._id;
        const comments = await Comment.find({ videoId: videoId, parentId: null })
            .populate('commenter', 'username profileUrl')
            .sort({ createdAt: -1 })
            .lean();

        const newComment = comments.map((comment) => {
            return {
                ...comment,
                isLikedByMe: (comment.likes || []).some(
                    (userId) => userId.toString() === req.user._id.toString()
                )
            };
        });

        res.status(200).json({ newComment, userId });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
};

// @desc    Post a reply to a comment
// @route   POST /api/postreply
// @access  Private
const postReply = async (req, res) => {
    const { text, parentId } = req.body;
    try {
        const newReply = await Comment.create({
            text,
            parentId,
            commenter: req.user._id
        });

        const populatedReply = await Comment.findById(newReply._id)
            .populate('commenter', 'username profileUrl');

        res.status(201).json(populatedReply);
    } catch (err) {
        console.error("Failed to post reply", err);
        res.status(500).json({ error: "Failed to post reply" });
    }
};

// @desc    Fetch replies for a comment
// @route   GET /api/fetchreplies
// @access  Public
const fetchReplies = async (req, res) => {
    try {
        const { parentId } = req.query;
        const replies = await Comment.find({ parentId })
            .populate('commenter', 'username profileUrl')
            .sort({ createdAt: 1 });
        res.json(replies);
    } catch (error) {
        console.error("Failed to fetch replies", error);
        res.status(500).json({ error: "Failed to fetch replies" });
    }
};

// @desc    Like or unlike a comment
// @route   PUT /api/dolikecomment
// @access  Private
const toggleLikeComment = async (req, res) => {
    try {
        const commentId = req.body.commentId;
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                message: 'comment not found'
            });
        }

        const alreadyLiked = (comment.likes || []).some(
            id => id.toString() === req.user._id.toString()
        );

        if (alreadyLiked) {
            comment.likes.pull(req.user._id);
        } else {
            comment.likes.addToSet(req.user._id);
        }

        const updatedComment = await comment.save();

        updatedComment.likedByMe = alreadyLiked;
        updatedComment.likesCount = updatedComment.likes.length;

        res.status(201).json({
            updatedComment
        });
    } catch (error) {
        console.error("cant like comment", error);
        res.status(500).json({ error: "Failed to like comment" });
    }
};

module.exports = {
    postComment,
    fetchComments,
    postReply,
    fetchReplies,
    toggleLikeComment
};
