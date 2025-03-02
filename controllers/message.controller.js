import mongoose from "mongoose";
import { UserModel } from "../models/user.model.js";
import messageModel from "../models/message.model.js";
import cloudinary from "../configs/cloudinary.js";


const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await UserModel.find({ _id: { $ne: loggedInUserId } }).select('-password'); // all users except me.. without password
        res.status(200).send(filteredUsers);
    } catch (error) {
        console.log('error in message route=> get usersidebar function ', error);
        res.status(400).send('server error');

    }
};

const getMessagesList = async (req, res) => {
    try {
        const myId = req.user._id;  //logged in user id
        const otheruserId = req.params.id;  //other user id

        const messages = await messageModel.find({
            $or: [
                { senderId: otheruserId, reciverId: myId }, // all messages where sender is other one and reiver is me or
                { reciverId: otheruserId, senderId: myId }  // render is me and reciver is other one
            ]
        });
        res.status(200).send(messages)
    }
    catch (e) {
        console.log(' error from getMessagesList function', e);
        res.status(500).send('server error')
    }

}

export { getUsersForSidebar, getMessagesList }