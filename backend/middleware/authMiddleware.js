const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/User'); 

const protect = async (req, res, next) => {
    try {
        // 1. Read the token from the cookie
        const token = req.cookies.token;

        // 2. Check if the token exists. 
        if (!token) {
           return res.status(401).json({ error: "Not authorized, no token provided" });
        }

        // 3. Verify and decode the token
       
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);

        // 4. Find the user in the database using the ID inside the decoded token
        
       req.user = await User.findById(decoded.id).select('-password');

        // 5.is user deleted
        if (!req.user) {
            return res.status(401).json({ error: "Not authorized, user account no longer exists" });
        }

        // 6. Success! The user is authenticated. Pass the baton to the next function.
        next();

    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        
      res.status(401).json({ error: "Not authorized, token failed or expired" });
    }
};

module.exports = { protect };