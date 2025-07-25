const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Track connected users and their active groups
const users = new Map(); // userId -> socketId
const groups = new Map(); // groupId -> Set of userIds

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // Register user with their ID
  socket.on('register-user', (userId) => {
    users.set(userId, socket.id);
    socket.userId = userId;
    console.log(`👤 User ${userId} registered`);
  });

  // ========== PRIVATE CHAT FUNCTIONALITY ==========
  socket.on('join-chat', ({ userId, recipientId }) => {
    const roomId = [userId, recipientId].sort().join('_');
    socket.join(roomId);
    console.log(`👥 ${userId} joined chat with ${recipientId} (Room: ${roomId})`);
  });

  socket.on('private-message', (data) => {
    const { senderId, recipientId, text } = data;
    const roomId = [senderId, recipientId].sort().join('_');
    
    if (!users.has(senderId)) {  // <-- Fixed this line (removed extra parenthesis)
      console.log('⚠️ Sender not connected');
      return;
    }

    socket.to(roomId).emit('receive-message', {
      text,
      senderId,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✉️ Private message from ${senderId} to ${recipientId}`);
  });

  socket.on('typing', ({ senderId, recipientId, userName }) => {
    const roomId = [senderId, recipientId].sort().join('_');
    socket.to(roomId).emit('typing', { senderId, userName });
  });

  socket.on('stop-typing', ({ senderId, recipientId }) => {
    const roomId = [senderId, recipientId].sort().join('_');
    socket.to(roomId).emit('stop-typing', { senderId });
  });

  // ========== PEER GROUP FUNCTIONALITY ==========
  socket.on('join-peer-group', ({ groupId, userId, userName }) => {
    socket.join(groupId);
    
    // Track group membership
    if (!groups.has(groupId)) {
      groups.set(groupId, new Set());
    }
    groups.get(groupId).add(userId);
    
    // Broadcast to group that user joined
    socket.to(groupId).emit('user-joined-group', { 
      userId, 
      userName,
      timestamp: new Date().toISOString()
    });
    
    console.log(`👥 ${userName} (${userId}) joined group ${groupId}`);
  });

  socket.on('leave-peer-group', ({ groupId, userId }) => {
    socket.leave(groupId);
    
    // Update group membership
    if (groups.has(groupId)) {
      groups.get(groupId).delete(userId);
    }
    
    // Broadcast to group that user left
    socket.to(groupId).emit('user-left-group', { 
      userId,
      timestamp: new Date().toISOString()
    });
    
    console.log(`👋 User ${userId} left group ${groupId}`);
  });

  socket.on('group-message', (data) => {
    const { groupId, senderId, text, senderName } = data;
    
    if (!groups.has(groupId) || !groups.get(groupId).has(senderId)) {
      console.log('⚠️ User not in group or group doesn\'t exist');
      return;
    }
    
    socket.to(groupId).emit('receive-group-message', {
      text,
      senderId,
      senderName,
      groupId,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📢 Group message from ${senderName} in ${groupId}`);
  });

  socket.on('group-typing', ({ groupId, senderId, userName }) => {
    if (groups.has(groupId) && groups.get(groupId).has(senderId)) {
      socket.to(groupId).emit('group-typing', { 
        groupId, 
        senderId, 
        userName 
      });
    }
  });

  socket.on('group-stop-typing', ({ groupId, senderId, userName }) => {
    socket.to(groupId).emit('group-stop-typing', { 
      groupId, 
      senderId, 
      userName 
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      const userId = socket.userId;
      users.delete(userId);
      
      // Remove user from all groups
      groups.forEach((userSet, groupId) => {
        if (userSet.has(userId)) {  // <-- Fixed this line (removed extra parenthesis)
          userSet.delete(userId);
          socket.to(groupId).emit('user-left-group', { 
            userId,
            timestamp: new Date().toISOString()
          });
        }
      });
      
      console.log(`🔴 User ${userId} disconnected`);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    users: users.size,
    groups: groups.size
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});