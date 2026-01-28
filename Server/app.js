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

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
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
