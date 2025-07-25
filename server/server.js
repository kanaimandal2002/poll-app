require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('joinPoll', (pollId) => {
    socket.join(pollId);
    console.log(`User joined poll: ${pollId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = { io };
