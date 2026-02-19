// ...existing code...
// ...existing code...
// ...existing code...
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const apiRouter = express.Router();
// Track participants in memory (for demo; use DB for production)
const roomParticipants = {};

app.use(cors());
app.use(express.json());

// ========== USER AUTHENTICATION ========== 
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// JWT middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

apiRouter.post('/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

apiRouter.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

apiRouter.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// ========== WORKSPACES API (PLACEHOLDER) ========== 
apiRouter.get('/workspaces', (req, res) => {
  res.json({ workspaces: [] });
});
apiRouter.get('/workspaces/:id', (req, res) => {
  res.json({ workspace: null });
});
apiRouter.post('/workspaces', (req, res) => {
  res.status(201).json({ workspace: req.body });
});
apiRouter.put('/workspaces/:id', (req, res) => {
  res.json({ workspace: req.body });
});
apiRouter.delete('/workspaces/:id', (req, res) => {
  res.json({ success: true });
});
apiRouter.put('/workspaces/:id/star', (req, res) => {
  res.json({ starred: true });
});
apiRouter.post('/workspaces/:id/collaborators', (req, res) => {
  res.json({ collaborator: req.body });
});

// ========== DASHBOARD API (PLACEHOLDER) ==========
apiRouter.get('/dashboard/stats', (req, res) => {
  res.json({ stats: { users: 1, workspaces: 0, activities: 0 } });
});
apiRouter.get('/dashboard/activity', (req, res) => {
  res.json({ activity: [] });
});
apiRouter.get('/dashboard/languages', (req, res) => {
  res.json({ languages: [] });
});
apiRouter.get('/dashboard/activities', (req, res) => {
  res.json({ activities: [] });
});
apiRouter.post('/dashboard/activities', (req, res) => {
  res.status(201).json({ activity: req.body });
});

// Create temp directory for code execution
const tempDir = path.join(os.tmpdir(), "syncide-exec");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// normal HTTP route
app.get("/", (req, res) => {
  res.send("SyncIDE backend with WebSocket running 🚀");
});

// Mount API routes under /api
app.use("/api", apiRouter);

// ========== CODE EXECUTION API ==========
apiRouter.post("/execute", async (req, res) => {
  const { code, language } = req.body;
  
  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  const timestamp = Date.now();
  let filename, command, args;

  try {
    switch (language) {
      case "javascript":
        filename = path.join(tempDir, `code_${timestamp}.js`);
        fs.writeFileSync(filename, code);
        command = "node";
        args = [filename];
        break;
        
      case "python":
        filename = path.join(tempDir, `code_${timestamp}.py`);
        fs.writeFileSync(filename, code);
        command = "python3";
        args = [filename];
        break;
        
      case "typescript":
        filename = path.join(tempDir, `code_${timestamp}.ts`);
        fs.writeFileSync(filename, code);
        // Try to use ts-node or transpile then run
        command = "npx";
        args = ["ts-node", filename];
        break;
        
      case "java":
        // Java needs class name to match filename
        const classMatch = code.match(/public\s+class\s+(\w+)/);
        const className = classMatch ? classMatch[1] : "Main";
        filename = path.join(tempDir, `${className}.java`);
        fs.writeFileSync(filename, code);
        // Compile and run
        return executeJava(filename, className, tempDir, res);
        
      case "cpp":
      case "c":
        const ext = language === "cpp" ? "cpp" : "c";
        filename = path.join(tempDir, `code_${timestamp}.${ext}`);
        const outputFile = path.join(tempDir, `code_${timestamp}`);
        fs.writeFileSync(filename, code);
        // Compile and run
        return executeCpp(filename, outputFile, language, res);
        
      case "go":
        filename = path.join(tempDir, `code_${timestamp}.go`);
        fs.writeFileSync(filename, code);
        command = "go";
        args = ["run", filename];
        break;
        
      case "rust":
        filename = path.join(tempDir, `code_${timestamp}.rs`);
        const rustOutput = path.join(tempDir, `code_${timestamp}`);
        fs.writeFileSync(filename, code);
        return executeRust(filename, rustOutput, res);
        
      case "ruby":
        filename = path.join(tempDir, `code_${timestamp}.rb`);
        fs.writeFileSync(filename, code);
        command = "ruby";
        args = [filename];
        break;
        
      case "php":
        filename = path.join(tempDir, `code_${timestamp}.php`);
        fs.writeFileSync(filename, code);
        command = "php";
        args = [filename];
        break;
        
      case "bash":
      case "shell":
        filename = path.join(tempDir, `code_${timestamp}.sh`);
        fs.writeFileSync(filename, code);
        command = "bash";
        args = [filename];
        break;
        
      default:
        return res.status(400).json({ error: `Language '${language}' is not supported for execution` });
    }

    // Execute the code
    const startTime = Date.now();
    const child = spawn(command, args, { 
      timeout: 30000,
      cwd: tempDir 
    });
    
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (exitCode) => {
      const duration = Date.now() - startTime;
      
      // Cleanup
      try { fs.unlinkSync(filename); } catch (e) {}
      
      res.json({
        success: exitCode === 0,
        output: stdout,
        error: stderr,
        exitCode,
        duration,
      });
    });

    child.on("error", (err) => {
      try { fs.unlinkSync(filename); } catch (e) {}
      
      res.json({
        success: false,
        output: "",
        error: err.message,
        exitCode: 1,
        duration: 0,
      });
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Java execution helper
function executeJava(filename, className, tempDir, res) {
  const startTime = Date.now();
  
  exec(`javac ${filename}`, { cwd: tempDir, timeout: 30000 }, (compileErr, compileOut, compileStderr) => {
    if (compileErr) {
      try { fs.unlinkSync(filename); } catch (e) {}
      return res.json({
        success: false,
        output: "",
        error: `Compilation Error:\n${compileStderr}`,
        exitCode: 1,
        duration: Date.now() - startTime,
      });
    }
    
    exec(`java -cp ${tempDir} ${className}`, { timeout: 30000 }, (runErr, stdout, stderr) => {
      const duration = Date.now() - startTime;
      
      // Cleanup
      try { 
        fs.unlinkSync(filename); 
        fs.unlinkSync(path.join(tempDir, `${className}.class`));
      } catch (e) {}
      
      res.json({
        success: !runErr,
        output: stdout,
        error: stderr || (runErr ? runErr.message : ""),
        exitCode: runErr ? 1 : 0,
        duration,
      });
    });
  });
}

// C/C++ execution helper
function executeCpp(filename, outputFile, language, res) {
  const startTime = Date.now();
  const compiler = language === "cpp" ? "g++" : "gcc";
  
  exec(`${compiler} ${filename} -o ${outputFile}`, { timeout: 30000 }, (compileErr, compileOut, compileStderr) => {
    if (compileErr) {
      try { fs.unlinkSync(filename); } catch (e) {}
      return res.json({
        success: false,
        output: "",
        error: `Compilation Error:\n${compileStderr}`,
        exitCode: 1,
        duration: Date.now() - startTime,
      });
    }
    
    exec(outputFile, { timeout: 30000 }, (runErr, stdout, stderr) => {
      const duration = Date.now() - startTime;
      
      // Cleanup
      try { 
        fs.unlinkSync(filename); 
        fs.unlinkSync(outputFile);
      } catch (e) {}
      
      res.json({
        success: !runErr,
        output: stdout,
        error: stderr || (runErr ? runErr.message : ""),
        exitCode: runErr ? 1 : 0,
        duration,
      });
    });
  });
}

// Rust execution helper
function executeRust(filename, outputFile, res) {
  const startTime = Date.now();
  
  exec(`rustc ${filename} -o ${outputFile}`, { timeout: 30000 }, (compileErr, compileOut, compileStderr) => {
    if (compileErr) {
      try { fs.unlinkSync(filename); } catch (e) {}
      return res.json({
        success: false,
        output: "",
        error: `Compilation Error:\n${compileStderr}`,
        exitCode: 1,
        duration: Date.now() - startTime,
      });
    }
    
    exec(outputFile, { timeout: 30000 }, (runErr, stdout, stderr) => {
      const duration = Date.now() - startTime;
      
      // Cleanup
      try { 
        fs.unlinkSync(filename); 
        fs.unlinkSync(outputFile);
      } catch (e) {}
      
      res.json({
        success: !runErr,
        output: stdout,
        error: stderr || (runErr ? runErr.message : ""),
        exitCode: runErr ? 1 : 0,
        duration,
      });
    });
  });
}

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


  // Join room and track participants
  socket.on("join-room", async (roomId, userNameParam) => {
    socket.join(roomId);
    // Normalize roomId casing for consistency
    const normalizedRoomId = roomId.toString();
    if (roomId !== normalizedRoomId) {
      console.warn(`[WARN] RoomId casing mismatch: received '${roomId}', normalized '${normalizedRoomId}'`);
    }
    console.log(`User ${socket.id} joined room ${normalizedRoomId}`);
    // Always initialize participants array if missing
    if (!roomParticipants[normalizedRoomId]) roomParticipants[normalizedRoomId] = [];
    // Debug: Print sockets in room and participant list after join
    const socketsInRoomDebug = Array.from(io.sockets.adapter.rooms.get(normalizedRoomId) || []);
    console.log(`[JOIN] Sockets in room ${normalizedRoomId}:`, socketsInRoomDebug);
    console.log(`[JOIN] Participants in room ${normalizedRoomId}:`, roomParticipants[normalizedRoomId]);
    // Use normalizedRoomId for all further logic in this handler
    roomId = normalizedRoomId;

    // Prefer username from param, then handshake, then fallback
    let userName = userNameParam || socket.handshake.query?.username || `User-${socket.id.slice(-4)}`;

    // Check if room exists in DB, create if not (atomic)
    let room = await Room.findOneAndUpdate(
      { roomId },
      { $setOnInsert: { code: `// JavaScript – SyncIDE\n// Author: Your Name\n// Date: ${new Date().toLocaleDateString()}\n\nfunction main() {\n  // Your code here\n  console.log("Hello, SyncIDE!");\n}\n\nmain();` } },
      { upsert: true, new: true }
    );
    let isNewRoom = roomParticipants[roomId] === undefined || roomParticipants[roomId].length === 0;

    // Add participant to room (deduplicate by socket.id only)
    if (!roomParticipants[roomId]) roomParticipants[roomId] = [];
    // If this socket is already in the room, do not add again
    if (!roomParticipants[roomId].some(u => u.id === socket.id)) {
      roomParticipants[roomId].push({
        id: socket.id,
        name: userName,
        initials: userName.split(' ').map(s => s[0]).join('').toUpperCase().slice(0,2),
        color: '#10b981',
        isHost: false,
        isYou: false,
        hasVideo: false,
      });
    }
    // Remove any accidental duplicates (by id only) after push
    roomParticipants[roomId] = roomParticipants[roomId].filter((user, idx, arr) =>
      arr.findIndex(u => u.id === user.id) === idx
    );
    // Remove any participants whose sockets are no longer connected (stale users)
    // Remove any participants whose sockets are not in the room (not just connected, but actually joined)
    const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
    roomParticipants[roomId] = roomParticipants[roomId].filter(u => socketsInRoom.has(u.id));
    // Always ensure only the participant whose id matches the first socket in the room is host
    const socketsInRoomArr = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    const hostSocketId = socketsInRoomArr[0];
    roomParticipants[roomId] = roomParticipants[roomId].map(u =>
      u.id === hostSocketId
        ? { ...u, isHost: true, color: '#f59e0b' }
        : { ...u, isHost: false, color: '#10b981' }
    );

    // Emit code only to the joining user
    if (room) {
      socket.emit("code-update", room.code);
    }

    // Emit updated participant list to all in room
    io.to(roomId).emit("room-users", roomParticipants[roomId]);
  });

  // code sync
  socket.on("code-change", async ({ roomId, code }) => {
    await Room.findOneAndUpdate({ roomId }, { code }, { upsert: true });

    io.to(roomId).emit("code-update", code);
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
    if (roomParticipants[roomId]) {
      roomParticipants[roomId] = roomParticipants[roomId].filter(u => u.id !== socket.id);
      // Remove any participants whose sockets are no longer connected (stale users)
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
      roomParticipants[roomId] = roomParticipants[roomId].filter(u => socketsInRoom.has(u.id));
      // Assign host to the participant whose id matches the first socket in the room
      const socketsInRoomArr = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      const hostSocketId = socketsInRoomArr[0];
      roomParticipants[roomId] = roomParticipants[roomId].map(u =>
        u.id === hostSocketId
          ? { ...u, isHost: true, color: '#f59e0b' }
          : { ...u, isHost: false, color: '#10b981' }
      );
      io.to(roomId).emit("room-users", roomParticipants[roomId]);
      // Debug: Print sockets in room and participant list after leave
      const socketsInRoomDebug = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      console.log(`[LEAVE] Sockets in room ${roomId}:`, socketsInRoomDebug);
      console.log(`[LEAVE] Participants in room ${roomId}:`, roomParticipants[roomId]);
    }
    socket.to(roomId).emit("user-left", { peerId: socket.id });
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Remove user from all rooms and update participants
    for (const roomId of socket.rooms) {
      if (roomParticipants[roomId]) {
        roomParticipants[roomId] = roomParticipants[roomId].filter(u => u.id !== socket.id);
        // Remove any participants whose sockets are no longer connected (stale users)
        const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
        roomParticipants[roomId] = roomParticipants[roomId].filter(u => socketsInRoom.has(u.id));
        // Always ensure only the first participant is host
        roomParticipants[roomId] = roomParticipants[roomId].map((u, idx) => idx === 0 ? { ...u, isHost: true, color: '#f59e0b' } : { ...u, isHost: false, color: '#10b981' });
        io.to(roomId).emit("room-users", roomParticipants[roomId]);
        // Debug: Print sockets in room and participant list after disconnect
        const socketsInRoomDebug = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        console.log(`[DISCONNECT] Sockets in room ${roomId}:`, socketsInRoomDebug);
        console.log(`[DISCONNECT] Participants in room ${roomId}:`, roomParticipants[roomId]);
      }
      socket.to(roomId).emit("user-left-video", { peerId: socket.id });
    }
  });
});


mongoose
  .connect(process.env.MONGODB_URI)
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
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
