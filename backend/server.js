const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Spark = require('./models/Spark')
const Video = require('./models/Video')
const path = require('path');
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

app.put('/api/changesparkstatus', async (req, res) => {

    console.log(req.body);

    const { newStatus, id } = req.body;

    const updatedSpark = await Spark.findByIdAndUpdate(id, { status: newStatus }, { new: true });

    console.log("frome ------update");
    console.log(updatedSpark);
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

app.put('/api/completespark', async (req, res) => {

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});