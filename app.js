import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from "./configs/mongodb.config.js";
import UserRouter from "./routes/user.route.js";
import { MessageRoute } from "./routes/message.route.js";

import {app,server } from "./configs/socket.io.js";




app.use(express.json());
app.use(cors())


app.use('/users',UserRouter);
app.use('/message',MessageRoute);







const PORT = process.env.PORT || 5000;


server.listen(+PORT,async () => {
    await connectDB();
    console.log('server started...');
    
})



// register user
// https://masai-x10-25hack.onrender.com/users/register

// login
// https://masai-x10-25hack.onrender.com/users/login

// link to forgot password
// https://masai-x10-25hack.onrender.com/users/forgot_password


// profil pic update
// https://masai-x10-25hack.onrender.com/users/update_profile_pic