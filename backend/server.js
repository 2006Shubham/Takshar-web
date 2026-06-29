const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Spark = require('./models/Spark')
const Video = require('./models/Video')
const Comment = require('./models/Comment');
const Connection = require('./models/Connection');
const path = require('path');
const { updateStreak } = require('./utils/streakUtils');
// Try loading from backend/.env first, fall back to root .env if not found
const env = require('dotenv').config({ path: path.resolve(__dirname, '.env') });
if (!process.env.JWT_SECRET) {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const jsonwebtoken = require('jsonwebtoken');

const cookieparser = require('cookie-parser');


const { protect } = require('./middleware/authMiddleware');

const cloudinary = require('./cloudinary');


const app = express();
app.use(cookieparser());

app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}))

const PORT = 5000;

app.use(express.json());


//connect to the mongo

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

app.get('/api/test', (req, res) => {
    res.json({
        message: "Backend server is up and running !"
    });

});

// 1. SIGNUP ROUTE
app.post('/api/signup', async (req, res) => {


    try {

        const { username, password } = req.body;




        if (!username || !password) {
            return res.status(400).json({ error: "username and the password is not defined" });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ error: "Username is already taken." });
        }


        const newUser = new User({
            username,
            password
        });

        await newUser.save();





        res.status(201).json({
            message: "User registered successfully",
            user: { username }
        });

    } catch (error) {
        console.error("Signup database error", error);
        res.status(500).json({ error: "Internal server error occured" });
    }

});


app.post('/api/login', async (req, res) => {

    try {

        const { username, password } = req.body;

        console.log("Recesives Login request for", username);

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" })
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ error: "username or password is incorrect" });
        }

        if (user.password != password) {
            return res.status(400).json({ error: "username or password is incorrect" });
        }

        const mytoken = jsonwebtoken.sign(
            { id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }
        );

        res.cookie(
            'token',
            mytoken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000

        })

        res.status(200).json({
            message: "Login sucessful!"
        });
    } catch (error) {
        console.error("Login Database error", error);
        res.status(500).json({ error: "Internal server error" });
    }

});

// route for to go on the home page


app.get('/api/feed', protect, async (req, res) => {

    res.status(200).json({
        message: "Welcome to the home page!",
        user: req.user
    });

});

// send spark route

app.post('/api/sendspark', protect, async (req, res) => {
    try {
        const { to, topic, createdAt, status } = req.body;
        const sender = req.user._id;
        const uname = req.user.username;
        console.log({ to, topic, createdAt, status, sender, uname });

        if (!sender || !to || !topic) {
            return res.status(400).json({ error: "Missing required fields: sender, to, or topic." });
        }

        const newSpark = new Spark({
            sender,
            to,
            topic,

        });

        const savedSpark = await newSpark.save();




        res.status(201).json({ message: "Spark sent successfully!", spark: newSpark });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
// get sent spark route

app.get('/api/sentsparks', protect, async (req, res) => {

    try {

        const userid = req.user._id;

        console.log("id is ", userid);
        const usersSentSparks = await Spark.find({ sender: userid }).populate(
            'to',
            'username profileUrl'
        );

        res.status(200).json({ usersSentSparks });

    }
    catch (error) {
        console.error("Error Fetching sent Sparks", error);
        res.status(500).json({ error: "Internal Server" });
    }
});

//get all users
app.get('/api/users', protect, async (req, res) => {

    try {

        const peers = await User.find({ _id: { $ne: req.user._id } }).select('username role');

        const peerList = peers.map(user => user);

        res.status(200).json({ userlist: peerList });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }

});



app.get('/api/receivedsparks', protect, async (req, res) => {
    try {


        const userid = req.user._id;
        // Query the database for all sparks sent TO this username
        const receivedsparkdoc = await Spark.find({ to: userid }).populate('sender',
            'profileUrl username'
        );

        console.log(receivedsparkdoc);

        res.status(200).json(receivedsparkdoc);

    } catch (error) {
        console.error("Error fetching received sparks:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


//spark dashboard content 

app.get('/api/sparkdashboard', protect, async (req, res) => {


    try {

        // We use Promise.all to fire both queries into the database at the exact same time.
        // It returns an array of results, which we destructure into two variables.


        const [sparkSent, sparkReceived] = await Promise.all(
            [
                Spark.find({ sender: req.user._id }),
                Spark.find({ to: req.user._id })
            ]
        )

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

});

//update the status of the sprak

app.put('/api/changesparkstatus', protect, async (req, res) => {

    console.log(req.body);

    const { newStatus, id } = req.body;

    const updatedSpark = await Spark.findByIdAndUpdate(id, { status: newStatus }, { new: true }).populate('sender', 'profileUrl username');

    console.log("frome ------update");
    console.log(updatedSpark);

    if (newStatus === 'success') {
        updateStreak(req.user._id);
    }

    res.status(201).json({ updatedSpark });

});

// upload sign route

app.get('/api/uploadsignature', protect, (req, res) => {

    try {

        const timestamp = Math.floor(Date.now() / 1000);

        const folder = 'takshar/videos';

        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp, folder
            },

            process.env.API_SECRET
        );

        console.log({
            timestamp, signature, apiKey: process.env.API_KEY,

            cloudName: process.env.CLOUD_NAME,
            folder
        });

        res.status(200).json({
            timestamp, signature, apiKey: process.env.API_KEY,

            cloudName: process.env.CLOUD_NAME,
            folder
        });

    } catch (error) {
        res.status(500).json({
            erro: error.message
        });
    }


});

// completespark route

app.put('/api/completespark', protect, async (req, res) => {

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
            video.spark._id, {
            videoId: saveVideo._id
        },

            {
                new: true
            }
        )

        console.log("Succes added id to spark : ", updatedSpark);

        return res.status(201).json({
            message: "Vidio saved",
            video: saveVideo
        })



    } catch (error) {
        console.log("cant save vidio", error);
    }



})

app.get('/api/getfeed', protect, async (req, res) => {

    try {
        const videos = await Video.find().populate({

            path: 'spark',
            populate: [
                {
                    path: 'sender',
                    select: 'username profileUrl'
                },

                {
                    path: 'to',
                    select: 'username profileUrl'
                }
            ]


        }).lean();



        const newVideos = videos.map((video) => {

            return {

                ...video,
                isLikedByMe: video.likes.some(
                    (userId) => userId.toString() === req.user._id.toString()
                )

            };

        })


        console.log(newVideos);

        res.status(200).json({ newVideos });


    } catch (error) {
        console.log("cant send feed", error);
    }


});

// do like 

app.put('/api/dolike', protect, async (req, res) => {

    try {
        const videoId = req.body.videoId;
        console.log(videoId);

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
            video.likes.pull(
                req.user._id
            )
        } else {
            video.likes.addToSet(req.user._id);
        }

        const updatedVideo = await video.save();

        updatedVideo.likedByMe = alreadyLiked;

        updatedVideo.likesCount = updatedVideo.likes.length;

        console.log(updatedVideo);

        res.status(201).json({
            updatedVideo
        })


    } catch (error) {
        console.log("cant like", error)
    }

});


app.put('/api/dolikecomment', protect, async (req, res) => {


    try {
        const commentId = req.body.commentId;
        console.log(commentId);

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
            comment.likes.pull(
                req.user._id
            )
        } else {
            comment.likes.addToSet(req.user._id);
        }

        const updatedComment = await comment.save();

        updatedComment.likedByMe = alreadyLiked;

        updatedComment.likesCount = updatedComment.likes.length;

        console.log(updatedComment);

        res.status(201).json({
            updatedComment
        })


    } catch (error) {
        console.log("cant like", error)
    }

});

app.get('/api/userprofile', protect, async (req, res) => {

    const userId = req.user._id;
    const user = await User.findById(userId)
    const username = user.username;
    const role = user.role;
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

            User.updateOne({ _id: user._id }, { currentStreak: 0 }).exec();
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
        displayStreak
    })

});

app.post('/api/postcomment', protect, async (req, res) => {

    const userId = req.user._id;
    const { text, videoId, parentId } = req.body;



    let newComment = new Comment({

        text,
        videoId: parentId ? null : videoId, // Keep videoId null if it's a reply
        parentId: parentId || null,         // Keep parentId null if it's a main comment
        commenter: userId
    });



    const savedComment = await newComment.save();

    newComment = await Comment.findById(newComment._id).populate('commenter', 'username profileUrl');

    res.status(201).json(newComment);
});

app.get('/api/fetchcomments', protect, async (req, res) => {

    const { videoId } = req.query;
    const userId = req.user._id;
    const comments = await Comment.find({ videoId: videoId, parentId: null })
        .populate('commenter', 'username profileUrl').
        sort({ createdAt: -1 }).
        lean();

    const newComment = comments.map((comment) => {

        return {
            ...comment,
            isLikedByMe: comment.likes.some(
                (userId) => userId.toString() === req.user._id.toString()
            )

        };

    })


    res.status(200).json({ newComment: newComment, userId: userId });


})


// POST /api/postreply
app.post('/api/postreply', protect, async (req, res) => {
    const { text, parentId } = req.body;
    try {
        const newReply = await Comment.create({
            text,
            parentId,
            commenter: req.user._id
        });

        // Populate the user data before sending back
        const populatedReply = await Comment.findById(newReply._id)
            .populate('commenter', 'username profileUrl');

        res.status(201).json(populatedReply);
    } catch (err) {
        res.status(500).json({ error: "Failed to post reply" });
    }
});

// GET /api/fetchreplies?parentId=...
app.get('/api/fetchreplies', async (req, res) => {
    const { parentId } = req.query;
    const replies = await Comment.find({ parentId })
        .populate('commenter', 'username profileUrl')
        .sort({ createdAt: 1 });
    res.json(replies);
});

//connect to peeers



app.get('/api/network', protect, async (req, res) => {
    try {
        const userId = req.user.id; // From your auth middleware

        // 1. Fetch ALL connections involving this user
        const allConnections = await Connection.find({
            $or: [{ from: userId }, { to: userId }]
        }).populate('from to', 'username role profileUrl createdAt');

        const connections = [];
        const pendingReceived = [];
        const pendingSent = [];
        const excludedUserIds = [userId]; // We don't want to show the user themselves in 'Discover'

        // 2. Categorize connections and track IDs to exclude from 'Discover'
        allConnections.forEach(conn => {
            // Figure out who the "other" person is
            const isSender = conn.from._id.toString() === userId.toString();
            const peer = isSender ? conn.to : conn.from;

            excludedUserIds.push(peer._id.toString());

            if (conn.status === 'Accepted') {
                connections.push({ connectionId: conn._id, peer });
            } else if (conn.status === 'Pending') {
                if (isSender) pendingSent.push({ connectionId: conn._id, peer });
                else pendingReceived.push({ connectionId: conn._id, peer });
            }
        });

        // 3. Fetch Discover Pool (Everyone NOT in the excluded list)
        const discoverPeers = await User.find({
            _id: { $nin: excludedUserIds }
        }).select('username role profileUrl createdAt');

        res.status(200).json({
            discover: discoverPeers,
            connections,
            pending: { received: pendingReceived, sent: pendingSent }
        });

    } catch (error) {
        console.error("Network fetch error:", error);
        res.status(500).json({ error: "Failed to load network data." });
    }
});

// POST /api/network/connect
app.post('/api/connect', protect, async (req, res) => {
    try {
        const { to } = req.body;
        const from = req.user.id;

        if (from === to) return res.status(400).json({ error: "Cannot connect to yourself." });

        const existing = await Connection.findOne({
            $or: [{ from, to }, { from: to, to: from }]
        });

        if (existing) return res.status(400).json({ error: "Connection already exists." });

        const newConnection = await Connection.create({ from, to });

        // Populate the 'to' user so the frontend can immediately add them to the 'Sent' tab
        await newConnection.populate('to', 'username role profileUrl createdAt');

        res.status(201).json(newConnection);
    } catch (error) {
        res.status(500).json({ error: "Failed to send request." });
    }
});



/// PUT /api/network/respond
app.put('/api/network/respond', protect, async (req, res) => {
    try {
        const { connectionId, action } = req.body; // 'Accepted' or 'Declined'
        const userId = req.user.id;

        // 1. Find the connection
        const connection = await Connection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({ error: "Connection request not found." });
        }

        // 2. Ensure only the recipient can respond
        if (connection.to.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Not authorized to respond to this request." });
        }

        // 3. Process action
        if (action === 'Accepted') {
            connection.status = 'Accepted';
            await connection.save();

            // Update both users' peer arrays
            await User.findByIdAndUpdate(connection.from, {
                $addToSet: { peers: connection.to }
            });
            await User.findByIdAndUpdate(connection.to, {
                $addToSet: { peers: connection.from }
            });

            return res.status(200).json({ message: "Connection accepted successfully.", connection });

        } else if (action === 'Declined') {
            //  Delete the dead record entirely so they can discover each other again
            await Connection.findByIdAndDelete(connectionId);

            return res.status(200).json({ message: "Connection declined and removed." });
        } else {
            return res.status(400).json({ error: "Invalid action." });
        }

    } catch (error) {
        console.error("Error responding to connection:", error);
        res.status(500).json({ error: "Failed to process response." });
    }
});



// GET /api/leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Spark.aggregate([
            // 1. Only look at Sparks that were successfully completed
            {
                $match: { status: 'success' }
            },
            // 2. Group them by the receiver ('to') and count them up
            {
                $group: {
                    _id: "$to",
                    completedSparks: { $sum: 1 }
                }
            },
            // 3. Sort by highest completed sparks first
            {
                $sort: { completedSparks: -1 }
            },
            // 4. "Populate" the user data (name and profile pic) from the Users collection
            {
                $lookup: {
                    from: "users", // Must match your MongoDB collection name (usually lowercase plural)
                    localField: "_id",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            // 5. Unwind the array created by $lookup
            {
                $unwind: "$userData"
            },
            // 6. Format the final output to match what the React component expects
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
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});