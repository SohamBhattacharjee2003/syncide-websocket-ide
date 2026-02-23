require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Config
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const workspaceRoutes = require("./routes/workspace");
const dashboardRoutes = require("./routes/dashboard");
const executeRoutes = require("./routes/execute");

// Socket
const setupSocket = require("./socket");

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("SyncIDE backend with WebSocket running 🚀");
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/execute", executeRoutes);

// Create HTTP server & attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Setup socket handlers
setupSocket(io);

// Connect to database & start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
