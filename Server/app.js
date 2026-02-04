const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// normal HTTP route
app.get("/", (req, res) => {
  res.send("SyncIDE backend with WebSocket running 🚀");
});

// create HTTP server
const server = http.createServer(app);

// attach socket.io to server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// socket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    const room = await Room.findOne({ roomId });
    if (room) {
      socket.emit("code-update", room.code);
    }
  });

  // code sync
  socket.on("code-change", async ({ roomId, code }) => {
    await Room.findOneAndUpdate({ roomId }, { code }, { upsert: true });

    socket.to(roomId).emit("code-update", code);
  });

  // ========== VIDEO CALL EVENTS ==========
  
  // Join video call
  socket.on("join-video-call", ({ roomId, userName }) => {
    socket.to(roomId).emit("user-joined-video", { 
      peerId: socket.id, 
      userName 
    });
    console.log(`User ${userName} (${socket.id}) joined video call in room ${roomId}`);
  });

  // Leave video call
  socket.on("leave-video-call", ({ roomId, userName }) => {
    socket.to(roomId).emit("user-left-video", { 
      peerId: socket.id, 
      userName 
    });
    console.log(`User ${userName} (${socket.id}) left video call in room ${roomId}`);
  });

  // WebRTC signaling - Video offer
  socket.on("video-offer", ({ roomId, offer, to }) => {
    io.to(to).emit("video-offer", { 
      offer, 
      from: socket.id 
    });
  });

  // WebRTC signaling - Video answer
  socket.on("video-answer", ({ roomId, answer, to }) => {
    io.to(to).emit("video-answer", { 
      answer, 
      from: socket.id 
    });
  });

  // WebRTC signaling - ICE candidate
  socket.on("ice-candidate", ({ roomId, candidate, to }) => {
    io.to(to).emit("ice-candidate", { 
      candidate, 
      from: socket.id 
    });
  });

  // Screen sharing events
  socket.on("screen-share-started", ({ roomId, userName }) => {
    socket.to(roomId).emit("screen-share-started", { 
      peerId: socket.id, 
      userName 
    });
    console.log(`User ${userName} started screen sharing in room ${roomId}`);
  });

  socket.on("screen-share-stopped", ({ roomId, userName }) => {
    socket.to(roomId).emit("screen-share-stopped", { 
      peerId: socket.id, 
      userName 
    });
    console.log(`User ${userName} stopped screen sharing in room ${roomId}`);
  });

  // Chat messages
  socket.on("chat-message", ({ roomId, message }) => {
    socket.to(roomId).emit("chat-message", message);
  });

  // Cursor position sync
  socket.on("cursor-move", ({ roomId, position }) => {
    socket.to(roomId).emit("cursor-move", { 
      peerId: socket.id, 
      position 
    });
  });

  // Leave room
  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user-left", { peerId: socket.id });
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Broadcast to all rooms this user was in
    socket.rooms.forEach(roomId => {
      socket.to(roomId).emit("user-left-video", { peerId: socket.id });
    });
  });
});

const mongoose = require("mongoose"); // Move this to the top, before using mongoose

mongoose
  .connect(
    "mongodb+srv://sohambhattacharjee84:2003@cluster0.ohqp9.mongodb.net/syncide"
  )
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error(err);
  });

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true },
  code: { type: String },
});

const Room = mongoose.model("Room", RoomSchema);

// start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
