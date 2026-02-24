const Room = require("../models/Room");

// Track participants in memory (for demo; use DB for production)
const roomParticipants = {};
// Track host by username per room (persists across reloads)
const roomHosts = {};

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join room and track participants
    socket.on("join-room", async (roomId, userNameParam) => {
      socket.join(roomId);
      const normalizedRoomId = roomId.toString();
      if (roomId !== normalizedRoomId) {
        console.warn(`[WARN] RoomId casing mismatch: received '${roomId}', normalized '${normalizedRoomId}'`);
      }
      console.log(`User ${socket.id} joined room ${normalizedRoomId}`);

      if (!roomParticipants[normalizedRoomId]) roomParticipants[normalizedRoomId] = [];

      const socketsInRoomDebug = Array.from(io.sockets.adapter.rooms.get(normalizedRoomId) || []);
      console.log(`[JOIN] Sockets in room ${normalizedRoomId}:`, socketsInRoomDebug);
      console.log(`[JOIN] Participants in room ${normalizedRoomId}:`, roomParticipants[normalizedRoomId]);

      roomId = normalizedRoomId;

      let userName = userNameParam || socket.handshake.query?.username || `User-${socket.id.slice(-4)}`;

      // Check if room exists in DB, create if not (atomic)
      let room = await Room.findOneAndUpdate(
        { roomId },
        {
          $setOnInsert: {
            code: `// JavaScript – SyncIDE\n// Author: Your Name\n// Date: ${new Date().toLocaleDateString()}\n\nfunction main() {\n  // Your code here\n  console.log("Hello, SyncIDE!");\n}\n\nmain();`,
          },
        },
        { upsert: true, new: true }
      );

      // Add participant to room (deduplicate by socket.id, update name on re-join)
      if (!roomParticipants[roomId]) roomParticipants[roomId] = [];
      const existingUser = roomParticipants[roomId].find((u) => u.id === socket.id);
      if (existingUser) {
        // Update name if changed (e.g. auth loaded after initial join)
        existingUser.name = userName;
        existingUser.initials = userName
          .split(" ")
          .map((s) => s[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      } else {
        roomParticipants[roomId].push({
          id: socket.id,
          name: userName,
          initials: userName
            .split(" ")
            .map((s) => s[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          color: "#10b981",
          isHost: false,
          isYou: false,
          hasVideo: false,
        });
      }

      // Remove duplicates
      roomParticipants[roomId] = roomParticipants[roomId].filter(
        (user, idx, arr) => arr.findIndex((u) => u.id === user.id) === idx
      );

      // Remove stale participants
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
      roomParticipants[roomId] = roomParticipants[roomId].filter((u) => socketsInRoom.has(u.id));

      // Assign host — persist by username so reloads don't change host
      if (!roomHosts[roomId] || !roomParticipants[roomId].some((u) => u.name === roomHosts[roomId])) {
        // No host set, or current host left — assign to this user
        roomHosts[roomId] = userName;
      }
      roomParticipants[roomId] = roomParticipants[roomId].map((u) =>
        u.name === roomHosts[roomId]
          ? { ...u, isHost: true, color: "#f59e0b" }
          : { ...u, isHost: false, color: "#10b981" }
      );

      // Emit code only to the joining user
      if (room) {
        socket.emit("code-update", room.code);
      }

      // Emit updated participant list to all in room
      io.to(roomId).emit("room-users", roomParticipants[roomId]);
    });

    // Code sync
    socket.on("code-change", async ({ roomId, code }) => {
      await Room.findOneAndUpdate({ roomId }, { code }, { upsert: true });
      io.to(roomId).emit("code-update", code);
    });

    // ========== VIDEO CALL EVENTS ==========

    socket.on("join-video-call", ({ roomId, userName }) => {
      socket.to(roomId).emit("user-joined-video", {
        peerId: socket.id,
        userName,
      });
      console.log(`User ${userName} (${socket.id}) joined video call in room ${roomId}`);
    });

    socket.on("leave-video-call", ({ roomId, userName }) => {
      socket.to(roomId).emit("user-left-video", {
        peerId: socket.id,
        userName,
      });
      console.log(`User ${userName} (${socket.id}) left video call in room ${roomId}`);
    });

    // WebRTC signaling
    socket.on("video-offer", ({ roomId, offer, to }) => {
      io.to(to).emit("video-offer", { offer, from: socket.id });
    });

    socket.on("video-answer", ({ roomId, answer, to }) => {
      io.to(to).emit("video-answer", { answer, from: socket.id });
    });

    socket.on("ice-candidate", ({ roomId, candidate, to }) => {
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    // Speaking state broadcast
    socket.on("speaking-state", ({ roomId, isSpeaking }) => {
      socket.to(roomId).emit("speaking-state", {
        peerId: socket.id,
        isSpeaking,
      });
    });

    // Screen sharing
    socket.on("screen-share-started", ({ roomId, userName }) => {
      socket.to(roomId).emit("screen-share-started", {
        peerId: socket.id,
        userName,
      });
      console.log(`User ${userName} started screen sharing in room ${roomId}`);
    });

    socket.on("screen-share-stopped", ({ roomId, userName }) => {
      socket.to(roomId).emit("screen-share-stopped", {
        peerId: socket.id,
        userName,
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
        position,
      });
    });

    // Leave room
    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      if (roomParticipants[roomId]) {
        roomParticipants[roomId] = roomParticipants[roomId].filter((u) => u.id !== socket.id);
        const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
        roomParticipants[roomId] = roomParticipants[roomId].filter((u) => socketsInRoom.has(u.id));

        // Reassign host if the current host left
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
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const roomId of socket.rooms) {
        if (roomParticipants[roomId]) {
          roomParticipants[roomId] = roomParticipants[roomId].filter((u) => u.id !== socket.id);
          const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
          roomParticipants[roomId] = roomParticipants[roomId].filter((u) => socketsInRoom.has(u.id));
          // Reassign host if the current host disconnected
          if (roomHosts[roomId] && !roomParticipants[roomId].some((u) => u.name === roomHosts[roomId])) {
            roomHosts[roomId] = roomParticipants[roomId][0]?.name || null;
          }
          roomParticipants[roomId] = roomParticipants[roomId].map((u) =>
            u.name === roomHosts[roomId]
              ? { ...u, isHost: true, color: "#f59e0b" }
              : { ...u, isHost: false, color: "#10b981" }
          );
          io.to(roomId).emit("room-users", roomParticipants[roomId]);

          const socketsInRoomDebug = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
          console.log(`[DISCONNECT] Sockets in room ${roomId}:`, socketsInRoomDebug);
          console.log(`[DISCONNECT] Participants in room ${roomId}:`, roomParticipants[roomId]);
        }
        socket.to(roomId).emit("user-left-video", { peerId: socket.id });
      }
    });
  });
}

module.exports = setupSocket;
