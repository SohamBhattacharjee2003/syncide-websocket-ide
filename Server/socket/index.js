const { spawn } = require("child_process");
const os = require("os");
const Room = require("../models/Room");

// UNIFIED PARTICIPANT TRACKING - Single source of truth
const roomParticipants = {}; // { roomId: [{ id, name, initials, color, isHost, hasVideo }] }
const roomHosts = {}; // { roomId: socketId }
const videoCallParticipants = {}; // { roomId: Set<socketId> }
const terminalSessions = {}; // { socketId: process }

// Helper: Clean stale participants from a room
function cleanStaleParticipants(io, roomId) {
  if (!roomParticipants[roomId]) return;
  
  const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
  const before = roomParticipants[roomId].length;
  
  roomParticipants[roomId] = roomParticipants[roomId].filter((u) => {
    const isActive = socketsInRoom.has(u.id);
    if (!isActive) {
      console.log(`[Clean] Removing stale participant ${u.name} (${u.id}) from room ${roomId}`);
    }
    return isActive;
  });
  
  const after = roomParticipants[roomId].length;
  if (before !== after) {
    console.log(`[Clean] Room ${roomId}: Cleaned ${before - after} stale participants`);
  }
}

// Helper: Assign or reassign host
function assignHost(io, roomId) {
  if (!roomParticipants[roomId] || roomParticipants[roomId].length === 0) {
    delete roomHosts[roomId];
    console.log(`[Host] Room ${roomId}: No participants, cleared host`);
    return;
  }
  
  const currentHost = roomHosts[roomId];
  const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
  
  // Check if current host is still valid
  if (currentHost && socketsInRoom.has(currentHost)) {
    console.log(`[Host] Room ${roomId}: Host ${currentHost} still valid`);
    return;
  }
  
  // If no host exists, assign the FIRST participant who joined (not by array order)
  // Find the participant with the earliest join time or use first in array
  if (!roomHosts[roomId]) {
    const newHost = roomParticipants[roomId][0];
    roomHosts[roomId] = newHost.id;
    console.log(`[Host] Room ${roomId}: Assigned ${newHost.name} (${newHost.id}) as NEW host`);
  }
}

// Helper: Update host flags on all participants
function updateHostFlags(roomId) {
  if (!roomParticipants[roomId]) return;
  
  const hostId = roomHosts[roomId];
  roomParticipants[roomId] = roomParticipants[roomId].map((u) => ({
    ...u,
    isHost: u.id === hostId,
    color: u.id === hostId ? "#f59e0b" : "#10b981",
  }));
}

// Helper: Broadcast updated participant list
function broadcastParticipants(io, roomId) {
  if (!roomParticipants[roomId]) return;
  
  console.log(`[Broadcast] Room ${roomId}: Sending ${roomParticipants[roomId].length} participants`);
  io.to(roomId).emit("room-users", roomParticipants[roomId]);
}

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log(`[Connection] User connected: ${socket.id}`);

    // ── JOIN ROOM ────────────────────────────────────────────────────────────
    socket.on("join-room", async (roomId, userNameParam) => {
      const normalizedRoomId = roomId.toString().toUpperCase();
      const userName = userNameParam || `User-${socket.id.slice(-4)}`;

      console.log(`[Join] ${userName} (${socket.id}) joining room ${normalizedRoomId}`);

      // Load or create room in database
      let room = await Room.findOneAndUpdate(
        { roomId: roomId.toString() },
        {
          $setOnInsert: {
            code: `// JavaScript – SyncIDE\n// Author: ${userName}\n// Date: ${new Date().toLocaleDateString()}\n\nfunction main() {\n  console.log("Hello, SyncIDE!");\n}\n\nmain();`,
          },
        },
        { upsert: true, new: true }
      );

      // Join Socket.IO room
      socket.join(normalizedRoomId);

      // Initialize room participants array if needed
      if (!roomParticipants[normalizedRoomId]) {
        roomParticipants[normalizedRoomId] = [];
      }

      // Clean stale participants BEFORE adding new one
      cleanStaleParticipants(io, normalizedRoomId);

      // Check if this socket is already in the room (reconnection/reload)
      const existingIndex = roomParticipants[normalizedRoomId].findIndex((u) => u.id === socket.id);
      
      if (existingIndex >= 0) {
        // Update existing participant
        console.log(`[Join] Updating existing participant ${socket.id}`);
        roomParticipants[normalizedRoomId][existingIndex].name = userName;
        roomParticipants[normalizedRoomId][existingIndex].initials = userName
          .split(" ")
          .map((s) => s[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      } else {
        // Add new participant
        console.log(`[Join] Adding new participant ${socket.id} (${userName})`);
        roomParticipants[normalizedRoomId].push({
          id: socket.id,
          name: userName,
          initials: userName.split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2),
          color: "#10b981",
          isHost: false,
          hasVideo: false,
        });
      }

      // Assign host if needed
      assignHost(io, normalizedRoomId);

      // Update host flags
      updateHostFlags(normalizedRoomId);

      // Send current code to new joiner
      if (room) {
        socket.emit("code-update", room.code);
      }

      // Broadcast updated participant list
      broadcastParticipants(io, normalizedRoomId);

      console.log(`[Join] Room ${normalizedRoomId} now has ${roomParticipants[normalizedRoomId].length} participants`);
      
      // Don't auto-trigger video call - let user manually join
      console.log(`[Join] User ${userName} joined room ${normalizedRoomId}, waiting for manual video call join`);
    });

    // ── CODE SYNC ────────────────────────────────────────────────────────────
    socket.on("code-change", async ({ roomId, code }) => {
      const normalizedRoomId = roomId.toString().toUpperCase();
      
      // Save to database
      await Room.findOneAndUpdate(
        { roomId: roomId.toString() },
        { code },
        { upsert: true }
      );
      
      // Broadcast to others in room
      socket.to(normalizedRoomId).emit("code-update", code);
    });

    // ── VIDEO CALL: JOIN ─────────────────────────────────────────────────────
    socket.on("join-video-call", ({ roomId, userName }) => {
      const normalizedRoomId = roomId?.toString().toUpperCase();
      if (!normalizedRoomId) return;

      console.log(`[Video] ${userName} (${socket.id}) joining video call in room ${normalizedRoomId}`);

      // Initialize video call tracking for this room
      if (!videoCallParticipants[normalizedRoomId]) {
        videoCallParticipants[normalizedRoomId] = new Set();
      }

      const peers = videoCallParticipants[normalizedRoomId];

      // Get list of existing peers (excluding this socket)
      const existingPeerIds = [...peers].filter((id) => id !== socket.id);

      // Send existing peers to the new joiner (with their names from roomParticipants)
      const existingPeersData = existingPeerIds.map((peerId) => {
        const participant = roomParticipants[normalizedRoomId]?.find((u) => u.id === peerId);
        return {
          peerId,
          userName: participant?.name || "Participant",
        };
      });

      console.log(`[Video] Sending ${existingPeersData.length} existing peers to ${socket.id}:`, existingPeersData);
      socket.emit("existing-video-peers", existingPeersData);

      // Add this socket to video call participants BEFORE notifying others
      peers.add(socket.id);

      // Notify existing peers about the new joiner
      existingPeerIds.forEach((peerId) => {
        console.log(`[Video] Notifying ${peerId} about new joiner ${socket.id}`);
        io.to(peerId).emit("user-joined-video", {
          peerId: socket.id,
          userName,
        });
      });

      // Update hasVideo flag in room participants
      if (roomParticipants[normalizedRoomId]) {
        const participant = roomParticipants[normalizedRoomId].find((u) => u.id === socket.id);
        if (participant) {
          participant.hasVideo = true;
          broadcastParticipants(io, normalizedRoomId);
        }
      }

      // Request media status from the new joiner after a short delay
      setTimeout(() => {
        console.log(`[Video] Requesting media status from ${socket.id}`);
        io.to(socket.id).emit("request-media-status", { from: "server" });
      }, 1000);

      console.log(`[Video] Room ${normalizedRoomId} now has ${peers.size} video participants`);
    });

    // ── VIDEO CALL: SIGNALING ────────────────────────────────────────────────
    socket.on("video-offer", ({ roomId, offer, to }) => {
      console.log(`[Signaling] Forwarding offer from ${socket.id} to ${to}`);
      io.to(to).emit("video-offer", { offer, from: socket.id });
    });

    socket.on("video-answer", ({ roomId, answer, to }) => {
      console.log(`[Signaling] Forwarding answer from ${socket.id} to ${to}`);
      io.to(to).emit("video-answer", { answer, from: socket.id });
    });

    socket.on("ice-candidate", ({ roomId, candidate, to }) => {
      console.log(`[Signaling] Forwarding ICE candidate from ${socket.id} to ${to}`);
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    // ── VIDEO CALL: MEDIA STATUS ─────────────────────────────────────────────
    socket.on("media-status-changed", ({ roomId, isMicOn, isCameraOn }) => {
      const normalizedRoomId = roomId?.toString().toUpperCase();
      if (!normalizedRoomId) return;

      console.log(`[Media] ${socket.id} status: mic=${isMicOn}, camera=${isCameraOn}`);
      
      // Broadcast to ALL participants in the room (including sender for confirmation)
      io.to(normalizedRoomId).emit("media-status-update", {
        peerId: socket.id,
        isMicOn,
        isCameraOn,
      });
    });

    socket.on("speaking-state", ({ roomId, isSpeaking }) => {
      const normalizedRoomId = roomId?.toString().toUpperCase();
      if (!normalizedRoomId) return;

      socket.to(normalizedRoomId).emit("speaking-state", {
        peerId: socket.id,
        isSpeaking,
      });
    });

    // Handle media status request
    socket.on("request-media-status", ({ roomId }) => {
      const normalizedRoomId = roomId?.toString().toUpperCase();
      if (!normalizedRoomId) return;
      console.log(`[Media] Broadcasting media status request in room ${normalizedRoomId}`);
      socket.to(normalizedRoomId).emit("request-media-status", { from: socket.id });
    });

    // ── VIDEO CALL: SCREEN SHARE ─────────────────────────────────────────────
    socket.on("screen-share-started", ({ roomId, userName }) => {
      const normalizedRoomId = roomId?.toString().toUpperCase();
      if (!normalizedRoomId) return;

      socket.to(normalizedRoomId).emit("screen-share-started", {
        peerId: socket.id,
        userName,
      });
    });

    socket.on("screen-share-stopped", ({ roomId, userName }) => {
      const normalizedRoomId = roomId?.toString().toUpperCase();
      if (!normalizedRoomId) return;

      socket.to(normalizedRoomId).emit("screen-share-stopped", {
        peerId: socket.id,
        userName,
      });
    });

    // ── VIDEO CALL: LEAVE ────────────────────────────────────────────────────
    socket.on("leave-video-call", ({ roomId, userName }) => {
      const normalizedRoomId = roomId?.toString().toUpperCase();
      if (!normalizedRoomId) return;

      console.log(`[Video] ${userName} (${socket.id}) leaving video call in room ${normalizedRoomId}`);

      if (videoCallParticipants[normalizedRoomId]) {
        videoCallParticipants[normalizedRoomId].delete(socket.id);

        // Clean up empty video room
        if (videoCallParticipants[normalizedRoomId].size === 0) {
          delete videoCallParticipants[normalizedRoomId];
        }
      }

      // Update hasVideo flag
      if (roomParticipants[normalizedRoomId]) {
        const participant = roomParticipants[normalizedRoomId].find((u) => u.id === socket.id);
        if (participant) {
          participant.hasVideo = false;
          broadcastParticipants(io, normalizedRoomId);
        }
      }

      // Notify others
      socket.to(normalizedRoomId).emit("user-left-video", {
        peerId: socket.id,
        userName,
      });
    });

    // ── CHAT ─────────────────────────────────────────────────────────────────
    socket.on("chat-message", ({ roomId, message }) => {
      const normalizedRoomId = roomId.toString().toUpperCase();
      socket.to(normalizedRoomId).emit("chat-message", message);
    });

    // ── CURSOR SYNC ──────────────────────────────────────────────────────────
    socket.on("cursor-move", ({ roomId, position }) => {
      const normalizedRoomId = roomId.toString().toUpperCase();
      socket.to(normalizedRoomId).emit("cursor-move", {
        peerId: socket.id,
        position,
      });
    });

    // ── TERMINAL ─────────────────────────────────────────────────────────────
    socket.on("terminal-start", () => {
      // Kill existing session if any
      if (terminalSessions[socket.id]) {
        try {
          terminalSessions[socket.id].kill();
        } catch (e) {}
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
          socket.emit("terminal-output", {
            data: `\r\n[Process exited with code ${code}]\r\n`,
          });
          socket.emit("terminal-closed");
          delete terminalSessions[socket.id];
        });

        proc.on("error", (err) => {
          socket.emit("terminal-output", {
            data: `\r\n[Terminal error: ${err.message}]\r\n`,
          });
          delete terminalSessions[socket.id];
        });

        socket.emit("terminal-ready");
        console.log(`[Terminal] Started for ${socket.id}`);
      } catch (err) {
        socket.emit("terminal-output", {
          data: `\r\n[Failed to start terminal: ${err.message}]\r\n`,
        });
      }
    });

    socket.on("terminal-input", ({ data }) => {
      const proc = terminalSessions[socket.id];
      if (proc && proc.stdin.writable) {
        proc.stdin.write(data);
      }
    });

    socket.on("terminal-resize", ({ cols, rows }) => {
      const proc = terminalSessions[socket.id];
      if (proc && proc.resize) {
        try {
          proc.resize(cols, rows);
        } catch (e) {}
      }
    });

    socket.on("terminal-stop", () => {
      const proc = terminalSessions[socket.id];
      if (proc) {
        try {
          proc.kill();
        } catch (e) {}
        delete terminalSessions[socket.id];
      }
    });

    // ── HOST: END SESSION ────────────────────────────────────────────────────
    socket.on("end-session", ({ roomId }) => {
      const normalizedRoomId = roomId?.toString().toUpperCase();
      if (!normalizedRoomId) return;

      // Check if sender is the host
      if (roomHosts[normalizedRoomId] === socket.id) {
        console.log(`[Host] ${socket.id} ending session for room ${normalizedRoomId}`);
        
        // Notify all clients
        io.to(normalizedRoomId).emit("session-ended");
        
        // Clean up room state
        delete roomParticipants[normalizedRoomId];
        delete roomHosts[normalizedRoomId];
        delete videoCallParticipants[normalizedRoomId];
      } else {
        console.warn(`[Host] Non-host ${socket.id} attempted to end session in room ${normalizedRoomId}`);
      }
    });

    // ── LEAVE ROOM ───────────────────────────────────────────────────────────
    socket.on("leave-room", (roomId) => {
      const normalizedRoomId = roomId.toString().toUpperCase();
      
      console.log(`[Leave] ${socket.id} leaving room ${normalizedRoomId}`);
      
      socket.leave(normalizedRoomId);

      // Remove from participants
      if (roomParticipants[normalizedRoomId]) {
        roomParticipants[normalizedRoomId] = roomParticipants[normalizedRoomId].filter(
          (u) => u.id !== socket.id
        );

        // Clean stale participants
        cleanStaleParticipants(io, normalizedRoomId);

        // Reassign host if needed
        assignHost(io, normalizedRoomId);

        // Update host flags
        updateHostFlags(normalizedRoomId);

        // Broadcast updated list
        broadcastParticipants(io, normalizedRoomId);
      }

      // Remove from video call
      if (videoCallParticipants[normalizedRoomId]) {
        videoCallParticipants[normalizedRoomId].delete(socket.id);
        if (videoCallParticipants[normalizedRoomId].size === 0) {
          delete videoCallParticipants[normalizedRoomId];
        }
      }

      // Notify others
      socket.to(normalizedRoomId).emit("user-left", { peerId: socket.id });
    });

    // ── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`[Disconnect] User disconnected: ${socket.id}`);

      // Kill terminal session
      if (terminalSessions[socket.id]) {
        try {
          terminalSessions[socket.id].kill();
        } catch (e) {}
        delete terminalSessions[socket.id];
      }

      // Clean up from all rooms
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue; // Skip the socket's own room

        // Remove from participants
        if (roomParticipants[roomId]) {
          const participant = roomParticipants[roomId].find((u) => u.id === socket.id);
          const userName = participant?.name || "Unknown";

          roomParticipants[roomId] = roomParticipants[roomId].filter(
            (u) => u.id !== socket.id
          );

          // Clean stale participants
          cleanStaleParticipants(io, roomId);

          // Reassign host if needed
          assignHost(io, roomId);

          // Update host flags
          updateHostFlags(roomId);

          // Broadcast updated list
          broadcastParticipants(io, roomId);

          // Notify about video call leave if they were in it
          if (videoCallParticipants[roomId]?.has(socket.id)) {
            socket.to(roomId).emit("user-left-video", {
              peerId: socket.id,
              userName,
            });
          }
        }

        // Remove from video call
        if (videoCallParticipants[roomId]) {
          videoCallParticipants[roomId].delete(socket.id);
          if (videoCallParticipants[roomId].size === 0) {
            delete videoCallParticipants[roomId];
          }
        }

        // Notify others
        socket.to(roomId).emit("user-left", { peerId: socket.id });
      }
    });
  });
}

module.exports = setupSocket;
