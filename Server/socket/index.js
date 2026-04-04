const { spawn } = require("child_process");
const os = require("os");
const Room = require("../models/Room");

// Track participants in memory
const roomParticipants = {};
const roomHosts = {};
// Track which socket IDs are in each room's video call
const videoRooms = new Map();
// Track terminal sessions per socket
const terminalSessions = {};

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ── Join room ────────────────────────────────────────────────────────────
    socket.on("join-room", async (roomId, userNameParam) => {
      socket.join(roomId);
      const normalizedRoomId = roomId.toString();
      roomId = normalizedRoomId;

      let userName = userNameParam || socket.handshake.query?.username || `User-${socket.id.slice(-4)}`;

      // Check if room exists in DB, create if not
      let room = await Room.findOneAndUpdate(
        { roomId },
        {
          $setOnInsert: {
            code: `// JavaScript – SyncIDE\n// Author: ${userName}\n// Date: ${new Date().toLocaleDateString()}\n\nfunction main() {\n  console.log("Hello, SyncIDE!");\n}\n\nmain();`,
          },
        },
        { upsert: true, new: true }
      );

      if (!roomParticipants[roomId]) roomParticipants[roomId] = [];

      // Deduplicate participants
      const existingUser = roomParticipants[roomId].find((u) => u.id === socket.id);
      if (existingUser) {
        existingUser.name = userName;
        existingUser.initials = userName.split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2);
      } else {
        roomParticipants[roomId].push({
          id: socket.id,
          name: userName,
          initials: userName.split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2),
          color: "#10b981",
          isHost: false,
          isYou: false,
          hasVideo: false,
        });
      }

      // Remove stale participants
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
      roomParticipants[roomId] = roomParticipants[roomId].filter((u) =>
        socketsInRoom.has(u.id)
      );

      // Assign host
      if (!roomHosts[roomId] || !roomParticipants[roomId].some((u) => u.name === roomHosts[roomId])) {
        roomHosts[roomId] = userName;
      }
      roomParticipants[roomId] = roomParticipants[roomId].map((u) =>
        u.name === roomHosts[roomId]
          ? { ...u, isHost: true, color: "#f59e0b" }
          : { ...u, isHost: false, color: "#10b981" }
      );

      if (room) socket.emit("code-update", room.code);
      io.to(roomId).emit("room-users", roomParticipants[roomId]);
    });

    // ── Code sync ────────────────────────────────────────────────────────────
    socket.on("code-change", async ({ roomId, code }) => {
      await Room.findOneAndUpdate({ roomId }, { code }, { upsert: true });
      socket.to(roomId).emit("code-update", code);
    });

    // ── VIDEO CALL EVENTS ────────────────────────────────────────────────────
    socket.on("join-video-call", ({ roomId, userName }) => {
      const room = roomId?.toString().toUpperCase();
      if (!room) return;
  
      if (!videoRooms.has(room)) videoRooms.set(room, new Set());
      const peers = videoRooms.get(room);
  
      // Tell the NEW joiner who's already in the room
      const existingPeerIds = [...peers].filter(id => id !== socket.id);
      socket.emit("existing-video-peers", existingPeerIds.map(peerId => ({ peerId })));
  
      // Tell EXISTING peers that someone new joined — send our socket.id as peerId
      existingPeerIds.forEach(peerId => {
        io.to(peerId).emit("user-joined-video", {
          peerId:   socket.id,   // ← CRITICAL: this must be socket.id of the JOINER
          userName,
        });
      });
  
      // Now add ourselves to the room
      peers.add(socket.id);
      socket.join(room);
  
      console.log(`[Video] ${userName} (${socket.id}) joined video in room ${room}. Peers: ${peers.size}`);
    });
  
    // Relay offer to specific peer, adding sender's socket.id as `from`
    socket.on("video-offer", ({ roomId, offer, to }) => {
      io.to(to).emit("video-offer", { offer, from: socket.id });
    });
  
    // Relay answer
    socket.on("video-answer", ({ roomId, answer, to }) => {
      io.to(to).emit("video-answer", { answer, from: socket.id });
    });
  
    // Relay ICE candidate
    socket.on("ice-candidate", ({ roomId, candidate, to }) => {
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });
  
    // Relay media status to everyone else in the room
    socket.on("media-status-changed", ({ roomId, isMicOn, isCameraOn }) => {
      const room = roomId?.toString().toUpperCase();
      if (!room) return;
      socket.to(room).emit("media-status-update", { peerId: socket.id, isMicOn, isCameraOn });
    });
  
    // Speaking state relay
    socket.on("speaking-state", ({ roomId, isSpeaking }) => {
      const room = roomId?.toString().toUpperCase();
      if (!room) return;
      socket.to(room).emit("speaking-state", { peerId: socket.id, isSpeaking });
    });
  
    // Screen share events
    socket.on("screen-share-started", ({ roomId, userName }) => {
      const room = roomId?.toString().toUpperCase();
      if (!room) return;
      socket.to(room).emit("screen-share-started", { peerId: socket.id, userName });
    });
  
    socket.on("screen-share-stopped", ({ roomId, userName }) => {
      const room = roomId?.toString().toUpperCase();
      if (!room) return;
      socket.to(room).emit("screen-share-stopped", { peerId: socket.id, userName });
    });
  
    socket.on("chat-message", ({ roomId, message }) => {
      socket.to(roomId).emit("chat-message", message);
    });

    socket.on("leave-video-call", ({ roomId, userName }) => {
      const room = roomId?.toString().toUpperCase();
      if (!room) return;
      const peers = videoRooms.get(room);
      if (peers) {
        peers.delete(socket.id);
        if (peers.size === 0) videoRooms.delete(room);
      }
      socket.to(room).emit("user-left-video", { peerId: socket.id, userName });
      console.log(`[Video] ${userName} (${socket.id}) left video in room ${room}`);
    });
  
    // Host ends the session — removes all participants and notifies everyone
    socket.on("end-session", ({ roomId }) => {
      const roomStr = roomId?.toString().toUpperCase();
      const room = roomParticipants[roomId] || [];
      const sender = room.find(u => u.id === socket.id);
      if (sender?.isHost) {
        io.to(roomId).emit("session-ended"); // notify all clients including sender
        // Clean up room state
        delete roomParticipants[roomId];
        delete roomHosts[roomId];
        if (roomStr) videoRooms.delete(roomStr);
      }
    });

    socket.on("cursor-move", ({ roomId, position }) => {
      socket.to(roomId).emit("cursor-move", { peerId: socket.id, position });
    });

    // ── INTERACTIVE TERMINAL ─────────────────────────────────────────────────
    socket.on("terminal-start", ({ roomId }) => {
      // Kill existing session if any
      if (terminalSessions[socket.id]) {
        try { terminalSessions[socket.id].kill(); } catch (e) {}
        delete terminalSessions[socket.id];
      }

      const shell = os.platform() === "win32" ? "cmd.exe" : "bash";
      const shellArgs = os.platform() === "win32" ? [] : ["-i"];

      try {
        const proc = spawn(shell, shellArgs, {
          env: { ...process.env, TERM: "xterm-256color", COLORTERM: "truecolor" },
          cwd: os.homedir(),
        });

        terminalSessions[socket.id] = proc;

        proc.stdout.on("data", (data) => {
          socket.emit("terminal-output", { data: data.toString() });
        });

        proc.stderr.on("data", (data) => {
          socket.emit("terminal-output", { data: data.toString() });
        });

        proc.on("close", (code) => {
          socket.emit("terminal-output", { data: `\r\n[Process exited with code ${code}]\r\n` });
          socket.emit("terminal-closed");
          delete terminalSessions[socket.id];
        });

        proc.on("error", (err) => {
          socket.emit("terminal-output", { data: `\r\n[Terminal error: ${err.message}]\r\n` });
          delete terminalSessions[socket.id];
        });

        socket.emit("terminal-ready");
        console.log(`[Terminal] Started shell for socket ${socket.id}`);
      } catch (err) {
        socket.emit("terminal-output", { data: `\r\n[Failed to start terminal: ${err.message}]\r\n` });
      }
    });

    socket.on("terminal-input", ({ data }) => {
      const proc = terminalSessions[socket.id];
      if (proc && proc.stdin.writable) {
        proc.stdin.write(data);
      }
    });

    socket.on("terminal-resize", ({ cols, rows }) => {
      // node-pty resize support — skip gracefully if not available
      const proc = terminalSessions[socket.id];
      if (proc && proc.resize) {
        try { proc.resize(cols, rows); } catch (e) {}
      }
    });

    socket.on("terminal-stop", () => {
      const proc = terminalSessions[socket.id];
      if (proc) {
        try { proc.kill(); } catch (e) {}
        delete terminalSessions[socket.id];
      }
    });

    // ── LEAVE ROOM ───────────────────────────────────────────────────────────
    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      if (roomParticipants[roomId]) {
        roomParticipants[roomId] = roomParticipants[roomId].filter((u) => u.id !== socket.id);
        const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
        roomParticipants[roomId] = roomParticipants[roomId].filter((u) => socketsInRoom.has(u.id));

        if (roomHosts[roomId] && !roomParticipants[roomId].some((u) => u.name === roomHosts[roomId])) {
          roomHosts[roomId] = roomParticipants[roomId][0]?.name || null;
        }
        roomParticipants[roomId] = roomParticipants[roomId].map((u) =>
          u.name === roomHosts[roomId]
            ? { ...u, isHost: true, color: "#f59e0b" }
            : { ...u, isHost: false, color: "#10b981" }
        );
        io.to(roomId).emit("room-users", roomParticipants[roomId]);
      }
      socket.to(roomId).emit("user-left", { peerId: socket.id });
    });

    // ── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // Kill terminal session
      if (terminalSessions[socket.id]) {
        try { terminalSessions[socket.id].kill(); } catch (e) {}
        delete terminalSessions[socket.id];
      }

      for (const roomId of socket.rooms) {
      // Clean up video call tracking
      for (const [room, peers] of videoRooms.entries()) {
        if (peers.has(socket.id)) {
          peers.delete(socket.id);
          if (peers.size === 0) videoRooms.delete(room);
          socket.to(room).emit("user-left-video", { peerId: socket.id });
        }
      }
        if (roomParticipants[roomId]) {
          roomParticipants[roomId] = roomParticipants[roomId].filter((u) => u.id !== socket.id);
          const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
          roomParticipants[roomId] = roomParticipants[roomId].filter((u) => socketsInRoom.has(u.id));

          if (roomHosts[roomId] && !roomParticipants[roomId].some((u) => u.name === roomHosts[roomId])) {
            roomHosts[roomId] = roomParticipants[roomId][0]?.name || null;
          }
          roomParticipants[roomId] = roomParticipants[roomId].map((u) =>
            u.name === roomHosts[roomId]
              ? { ...u, isHost: true, color: "#f59e0b" }
              : { ...u, isHost: false, color: "#10b981" }
          );
          io.to(roomId).emit("room-users", roomParticipants[roomId]);
        }
        socket.to(roomId).emit("user-left-video", { peerId: socket.id });
      }
    });
  });
}

module.exports = setupSocket;
