import express from 'express';

import { getUsersForSidebar, getMessagesList } from '../controllers/message.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const MessageRoute = express.Router()

MessageRoute.get('/', protectRoute, getUsersForSidebar);  // Load users for sidebar
MessageRoute.get('/:id', protectRoute, getMessagesList);  // id of the other user who is chatting with me ; frontend => async function loadChatHistory(userId) {

export { MessageRoute }