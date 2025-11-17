import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Enhanced in-memory storage
const users = new Map();
const rooms = ['general', 'random', 'tech', 'gaming', 'support'];
const messages = {
  general: [],
  random: [],
  tech: [],
  gaming: [],
  support: []
};
const privateMessages = new Map();
const typingUsers = new Map();

// Utility functions
const getUser = (userId) => users.get(userId);
const getRoomUsers = (room) => {
  return Array.from(users.values()).filter(user => user.room === room);
};

const getUserByUsername = (username) => {
  return Array.from(users.values()).find(user => user.username === username);
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins the chat
  socket.on('user_join', (userData) => {
    const user = {
      id: socket.id,
      username: userData.username,
      room: userData.room || 'general',
      isOnline: true,
      joinedAt: new Date(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`
    };
    
    users.set(socket.id, user);
    socket.join(user.room);

    // Notify room about new user
    socket.to(user.room).emit('user_joined', {
      user: user,
      users: getRoomUsers(user.room)
    });

    // Send room info to the user
    socket.emit('room_data', {
      room: user.room,
      users: getRoomUsers(user.room),
      messages: messages[user.room].slice(-100)
    });

    // Notify all users about updated user list
    io.emit('users_updated', Array.from(users.values()));
  });

  // Handle new message
  socket.on('send_message', (messageData) => {
    const user = getUser(socket.id);
    if (!user) return;

    const message = {
      id: uuidv4(),
      username: user.username,
      avatar: user.avatar,
      text: messageData.text,
      room: user.room,
      timestamp: new Date(),
      type: 'message',
      reactions: {}
    };

    // Store message
    messages[user.room].push(message);

    // Broadcast to room
    io.to(user.room).emit('receive_message', message);

    // Clear typing indicator
    typingUsers.delete(socket.id);
    socket.to(user.room).emit('user_typing', {
      users: Array.from(typingUsers.values()).filter(u => u.room === user.room)
    });
  });

  // Handle typing indicators
  socket.on('typing_start', () => {
    const user = getUser(socket.id);
    if (user) {
      typingUsers.set(socket.id, {
        username: user.username,
        room: user.room
      });
      socket.to(user.room).emit('user_typing', {
        users: Array.from(typingUsers.values()).filter(u => u.room === user.room)
      });
    }
  });

  socket.on('typing_stop', () => {
    const user = getUser(socket.id);
    if (user) {
      typingUsers.delete(socket.id);
      socket.to(user.room).emit('user_typing', {
        users: Array.from(typingUsers.values()).filter(u => u.room === user.room)
      });
    }
  });

  // Handle private messages
  socket.on('send_private_message', (data) => {
    const fromUser = getUser(socket.id);
    const toUser = getUserByUsername(data.toUsername);
    
    if (fromUser && toUser) {
      const privateMessage = {
        id: uuidv4(),
        from: fromUser.username,
        fromAvatar: fromUser.avatar,
        to: toUser.username,
        toAvatar: toUser.avatar,
        text: data.text,
        timestamp: new Date(),
        type: 'private',
        read: false
      };

      // Store private message
      const chatKey = [fromUser.username, toUser.username].sort().join('_');
      if (!privateMessages.has(chatKey)) {
        privateMessages.set(chatKey, []);
      }
      privateMessages.get(chatKey).push(privateMessage);

      // Send to both users
      io.to(socket.id).emit('receive_private_message', privateMessage);
      io.to(toUser.id).emit('receive_private_message', privateMessage);
      io.to(toUser.id).emit('new_private_message_notification', {
        from: fromUser.username,
        message: data.text
      });
    }
  });

  // Handle message reactions
  socket.on('react_to_message', (data) => {
    const user = getUser(socket.id);
    if (!user) return;

    const roomMessages = messages[data.room];
    const message = roomMessages.find(m => m.id === data.messageId);
    
    if (message) {
      if (!message.reactions) message.reactions = {};
      if (!message.reactions[data.reaction]) {
        message.reactions[data.reaction] = [];
      }
      
      // Remove existing reaction from this user
      Object.keys(message.reactions).forEach(reaction => {
        message.reactions[reaction] = message.reactions[reaction].filter(u => u !== user.username);
      });
      
      // Add new reaction
      message.reactions[data.reaction].push(user.username);
      
      io.to(data.room).emit('message_reacted', {
        messageId: data.messageId,
        reactions: message.reactions
      });
    }
  });

  // Handle room changes
  socket.on('change_room', (newRoom) => {
    const user = getUser(socket.id);
    if (!user) return;

    // Leave current room
    socket.leave(user.room);
    socket.to(user.room).emit('user_left', {
      username: user.username,
      users: getRoomUsers(user.room)
    });

    // Join new room
    user.room = newRoom;
    socket.join(newRoom);

    // Notify new room
    socket.to(newRoom).emit('user_joined', {
      user: user,
      users: getRoomUsers(newRoom)
    });

    // Send new room data to user
    socket.emit('room_data', {
      room: newRoom,
      users: getRoomUsers(newRoom),
      messages: messages[newRoom].slice(-100)
    });
  });

  // Mark private messages as read
  socket.on('mark_messages_read', (data) => {
    const chatKey = [data.user1, data.user2].sort().join('_');
    const chat = privateMessages.get(chatKey);
    
    if (chat) {
      chat.forEach(msg => {
        if (msg.to === getUser(socket.id).username) {
          msg.read = true;
        }
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = getUser(socket.id);
    if (user) {
      users.delete(socket.id);
      typingUsers.delete(socket.id);
      socket.to(user.room).emit('user_left', {
        username: user.username,
        users: getRoomUsers(user.room)
      });
      io.emit('users_updated', Array.from(users.values()));
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});