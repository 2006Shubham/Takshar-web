const User = require('../models/User');
const jsonwebtoken = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/signup
// @access  Public
const signup = async (req, res) => {
    try {
        const { username, password,role,organization } = req.body;
        let profileName = username;
        if (!username || !password) {
            return res.status(400).json({ error: "username and the password is not defined" });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ error: "Username is already taken." });
        }

        const newUser = new User({
            username,
            password,
            role,
            organization,
            profileName
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
};

// @desc    Auth user & set cookie token
// @route   POST /api/login
// @access  Public
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log("Recesives Login request for", username);

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" });
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
        });

        res.status(200).json({
            message: "Login sucessful!"
        });
    } catch (error) {
        console.error("Login Database error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const logout = async (req,res)=>{

    res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
   }) 

   res.status(200).json({message:"Succs logged out"});

}


module.exports = {
    signup,
    login,
    logout
};
