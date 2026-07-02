const User = require('../models/User');
const Spark = require('../models/Spark');

// @desc    Get all users list (peers directory) excluding current user
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
    try {
        const peers = await User.find({ _id: { $ne: req.user._id } }).select('username role');
        res.status(200).json({ userlist: peers });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// @desc    Get top users leaderboard sorted by completed sparks count
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Spark.aggregate([
            {
                $match: { status: 'success' }
            },
            {
                $group: {
                    _id: "$to",
                    completedSparks: { $sum: 1 }
                }
            },
            {
                $sort: { completedSparks: -1 }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $unwind: "$userData"
            },
            {
                $project: {
                    _id: 1,
                    completedSparks: 1,
                    username: "$userData.username",
                    profileUrl: "$userData.profileUrl"
                }
            }
        ]);

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Leaderboard fetch error:", error);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
};

// @desc    Get user profile data including sent/received spark counts and streak
// @route   GET /api/userprofile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }


        const username = user.username;
        const role = user.role;
        const organization = user.organization;
        const profileUrl = user.profileUrl;
        const peersCount = user.peers.length || 0;
        const [sentCount, receivedCount] = await Promise.all([
            Spark.countDocuments({ sender: userId }),
            Spark.countDocuments({ to: userId })
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let displayStreak = user.currentStreak;

        if (user.lastSparkCompletedAt) {
            const lastDate = new Date(user.lastSparkCompletedAt);
            lastDate.setHours(0, 0, 0, 0);

            const diffTime = today - lastDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If it's been more than 1 day since their last spark, their streak is dead.
            if (diffDays > 1) {
                displayStreak = 0;
                await User.updateOne({ _id: user._id }, { currentStreak: 0 }).exec();
            }
        }

        console.log("!!!!!!!!!!!!Seent Count !!!!!!!!!!", sentCount);
        console.log("!!!!!!!!!!!!Seent Count !!!!!!!!!!", receivedCount);

        res.json({
            sentCount,
            receivedCount,
            username,
            peersCount,
            role,
            profileUrl,
            displayStreak,
            organization
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
};

module.exports = {
    getUsers,
    getLeaderboard,
    getUserProfile
};
