import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import messageModel from '../models/message.model.js'; // Import messageModel

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

// Store user email to socket ID mapping
const userSocketMap = new Map();

// Middleware to verify JWT token
const verifyToken = async (token) => {  //token coming from frontend chat.js file  
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid token');
    }
};

io.use(async (socket, next) => {
//     The socket.handshake.auth object contains authentication data sent from the client.
// The jwt token is extracted from auth.token.
// If no token is provided, the connection is rejected with an authentication error.
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }


    //veryfind the cliend by jwt tokn
    try {
        const decoded = await verifyToken(token);
        socket.user = decoded; // Attach user info to socket
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        next(new Error('Authentication error: Invalid token'));
    }
});

io.on("connection", (socket) => {
    const userEmail = socket.user.email; // Extract email from verified token
    const userId = socket.user._id;

    console.log(`User connected: ${userEmail}, socket ID: ${socket.id}`);

    // Store the mapping
    userSocketMap.set(userId, socket.id);

    // Emit user online event to all connected clients
    io.emit('userOnline', { userId: userId, email: userEmail });

//private text message....
    socket.on('privateMessage', async ({ to, message, image }) => {
        const recipientSocketId = userSocketMap.get(to);

        // Store the message in the database
        try {
            const newMessage = new messageModel({
                senderId: userId,
                reciverId: to,
                text: message,
                image: image || null // Store image URL if available
            });
            await newMessage.save();

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('privateMessage', {
                    from: userEmail,
                    message: message,
                    image: image || null
                });
            } else {
                console.log(`User ${to} is not online`);
                socket.emit('userOffline', { userId: to });
            }
        } catch (error) {
            console.error('Error saving and sending message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${userEmail}, socket ID: ${socket.id}`);
        userSocketMap.delete(userId);
        io.emit('userOffline', { userId: userId, email: userEmail });
    });
});

export { io, app, server };