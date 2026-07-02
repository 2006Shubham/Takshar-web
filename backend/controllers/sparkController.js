const Spark = require('../models/Spark');
const Video = require('../models/Video');
const { updateStreak } = require('../utils/streakUtils');

// @desc    Send a new spark request to a peer
// @route   POST /api/sendspark
// @access  Private
const sendSpark = async (req, res) => {
    try {
        const { to, topic } = req.body;
        const sender = req.user._id;

        if (!sender || !to || !topic) {
            return res.status(400).json({ error: "Missing required fields: sender, to, or topic." });
        }

        const newSpark = new Spark({
            sender,
            to,
            topic
        });

        await newSpark.save();

        res.status(201).json({ message: "Spark sent successfully!", spark: newSpark });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Get all sparks sent by current user
// @route   GET /api/sentsparks
// @access  Private
const getSentSparks = async (req, res) => {
    try {
        const userid = req.user._id;
        const usersSentSparks = await Spark.find({ sender: userid }).populate(
            'to',
            'profileName profileUrl'
        );

        res.status(200).json({ usersSentSparks });
    } catch (error) {
        console.error("Error Fetching sent Sparks", error);
        res.status(500).json({ error: "Internal Server" });
    }
};

// @desc    Get all sparks received by current user
// @route   GET /api/receivedsparks
// @access  Private
const getReceivedSparks = async (req, res) => {
    try {
        const userid = req.user._id;
        const receivedsparkdoc = await Spark.find({ to: userid }).populate(
            'sender',
            'profileUrl profileName'
        );

        res.status(200).json(receivedsparkdoc);
    } catch (error) {
        console.error("Error fetching received sparks:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// @desc    Get summary list of both sent and received sparks for dashboard
// @route   GET /api/sparkdashboard
// @access  Private
const getSparkDashboard = async (req, res) => {
    try {
        const [sparkSent, sparkReceived] = await Promise.all([
            Spark.find({ sender: req.user._id }),
            Spark.find({ to: req.user._id })
        ]);

        res.status(200).json({
            message: "Welcome to home page",
            user: req.user,
            sparkSent: sparkSent,
            sparkReceived: sparkReceived
        });
    } catch (error) {
        console.error("Dashboard Data error", error);
        res.status(500).json({ error: "failed to load the dashboard" });
    }
};

// @desc    Update status of a spark (e.g. accepted, declined)
// @route   PUT /api/changesparkstatus
// @access  Public (or Private)
const changeSparkStatus = async (req, res) => {
    try {
        const { newStatus, id } = req.body;
        const updatedSpark = await Spark.findByIdAndUpdate(id, { status: newStatus }, { new: true });
        res.status(201).json({ updatedSpark });
    } catch (error) {
        console.error("Error changing spark status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// @desc    Submit a video response to a spark request (completing the spark)
// @route   PUT /api/completespark
// @access  Public (or Private)
const completeSpark = async (req, res) => {
    try {
        const video = req.body.completeSparkSubmision;

        console.log("i am at backend : ", video);

        const newVidio = new Video({
            owner: video.owner,
            spark: video.spark,
            videoUrl: video.secure_url,
            duration: video.duration,
            thumbnailUrl: video.thumbnailUrl
        });

        const saveVideo = await newVidio.save();

        const updatedSpark = await Spark.findByIdAndUpdate(
            video.spark._id, 
            {
                videoId: saveVideo._id,
                status: 'success'
            },
            {
                new: true
            }
        );

        console.log("Succes added id to spark : ", updatedSpark);

        // Update streak logic on completion
        await updateStreak(video.owner);

        return res.status(201).json({
            message: "Vidio saved",
            video: saveVideo
        });
    } catch (error) {
        console.error("cant save vidio", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    sendSpark,
    getSentSparks,
    getReceivedSparks,
    getSparkDashboard,
    changeSparkStatus,
    completeSpark
};
