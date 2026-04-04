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

// CORS — allow frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl) or matching origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in dev; restrict in prod
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "SyncIDE backend running 🚀" });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/execute", executeRoutes);

// Create HTTP server & attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

// Setup socket handlers
setupSocket(io);

// Connect to database & start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});
