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

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // code sync
  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-update", code);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
