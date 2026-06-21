const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');


const app = express();

const PORT = 5000;

app.use(express.json());
app.use(cors());

//connect to the mongo

mongoose.connect('mongodb://localhost:27017/auth_project')
.then(()=>console.log("Connected to local MongoDB successfully !"))
.catch((err)=>console.error("Mongo Connection error"))

app.get('/api/test',(req,res)=>{
    res.json({
        message:"Backend server is up and running !"
    });

});

// 1. SIGNUP ROUTE
app.post('/api/signup',async(req,res)=>{


    try{

    const {username, password} = req.body;

    
    

    if(!username || !password){
        return res.status(400).json({error:"username and the password is not defined"});
    }

    const existingUser = await User.findOne({username});

    if(existingUser){
        return res.status(400).json({error:"Username is already taken."});
    }


    const newUser = new User({
        username,
        password
    });

    await newUser.save();





    res.status(201).json({
        message: "User registered successfully",
        user:{username}
    });

}catch(error){
    console.error("Signup database error", error);
    res.status(500).json({error: "Internal server error occured"});
}

});


app.post('/api/login',async(req, res)=>{

    try{

    const{username, password} = req.body;

    console.log("Recesives Login request for",username);

    if(!username || !password){
        return res.status(400).json({error:"Username and password required"})
    }

    const user = await User.findOne({username});

    if(!user){
        return res.status(400).json({error:"username or password is incorrect"});
    }

    if (user.password != password){
        return res.status(400).json({error: "username or password is incorrect"});
    } 

    

    res.status(200).json({
        message:"Login sucessful!",
        token: "mock-jwt"
    });
}catch(error){
        console.error("Login Database error",error);
        res.status(500).json({error:"Internal server error"});
}

});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});