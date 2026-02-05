const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// Create temp directory for code execution
const tempDir = path.join(os.tmpdir(), "syncide-exec");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// normal HTTP route
app.get("/", (req, res) => {
  res.send("SyncIDE backend with WebSocket running 🚀");
});

// ========== CODE EXECUTION API ==========
app.post("/execute", async (req, res) => {
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
