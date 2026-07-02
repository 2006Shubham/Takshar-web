const Video = require('../models/Video');
const cloudinary = require('../cloudinary');

// @desc    Welcome home feed verification
// @route   GET /api/feed
// @access  Private
const getFeedWelcome = async (req, res) => {
    res.status(200).json({
        message: "Welcome to the home page!",
        user: req.user
    });
};

// @desc    Get all feed videos with populate & liked check
// @route   GET /api/getfeed
// @access  Private
const getFeedVideos = async (req, res) => {
    try {
        const videos = await Video.find().populate({
            path: 'spark',
            populate: [
                {
                    path: 'sender',
                    select: 'profileName profileUrl'
                },
                {
                    path: 'to',
                    select: 'profileName profileUrl'
                }
            ]
        }).lean();

        const newVideos = videos.map((video) => {
            return {
                ...video,
                isLikedByMe: (video.likes || []).some(
                    (userId) => userId.toString() === req.user._id.toString()
                )
            };
        });

        res.status(200).json({ newVideos });
    } catch (error) {
        console.log("cant send feed", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// @desc    Like or unlike a video
// @route   PUT /api/dolike
// @access  Private
const toggleLikeVideo = async (req, res) => {
    try {
        const videoId = req.body.videoId;
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({
                message: 'video not found'
            });
        }

        const alreadyLiked = (video.likes || []).some(
            id => id.toString() === req.user._id.toString()
        );

        if (alreadyLiked) {
            video.likes.pull(req.user._id);
        } else {
            video.likes.addToSet(req.user._id);
        }

        const updatedVideo = await video.save();

        updatedVideo.likedByMe = alreadyLiked;
        updatedVideo.likesCount = updatedVideo.likes.length;

        res.status(201).json({
            updatedVideo
        });
    } catch (error) {
        console.log("cant like", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// @desc    Generate Cloudinary upload signature
// @route   GET /api/uploadsignature
// @access  Private
const getUploadSignature = (req, res) => {
    try {
        const { uploadType } = req.query;
        const timestamp = Math.floor(Date.now() / 1000);
        const folderPaths = {
            video: 'takshar/videos',
            profile: 'takshar/profiles',
            banner: 'takshar/banners'
        };

        const folder = folderPaths[uploadType] || 'takshar/uncategorized';

        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder },
            process.env.API_SECRET
        );

        res.status(200).json({
            timestamp,
            signature,
            apiKey: process.env.API_KEY,
            cloudName: process.env.CLOUD_NAME,
            folder
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    getFeedWelcome,
    getFeedVideos,
    toggleLikeVideo,
    getUploadSignature
};
