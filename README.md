<div align="center">

# ⚡ SyncIDE

### A Real-Time Collaborative Web IDE with Integrated Video Calling

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-syncide--websocket--ide.vercel.app-blue?style=for-the-badge)](https://syncide-websocket-ide.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-SohamBhattacharjee2003-black?style=for-the-badge&logo=github)](https://github.com/SohamBhattacharjee2003/syncide-websocket-ide)
![JavaScript](https://img.shields.io/badge/JavaScript-99%25-yellow?style=for-the-badge&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 🧠 What is SyncIDE?

**SyncIDE** is a browser-based collaborative code editor that lets multiple developers write, edit, and review code **simultaneously in real time** — no setup, no installs, just open a browser and start coding together.

Think of it as **Google Docs for code**, with built-in **peer-to-peer video calling** so your team never needs to switch to Zoom or Meet during a coding session.

> Built to solve the fragmented remote pair-programming experience — where developers juggle between a code editor, a screen share tool, and a video call app all at once.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 **Real-Time Co-Editing** | Multiple users edit the same file simultaneously with live sync |
| 🖱️ **Live Cursor Tracking** | See every collaborator's cursor position in real time |
| 📹 **Built-in Video Calling** | Peer-to-peer video calls via WebRTC — no third-party tool needed |
| ⚡ **Sub-Second Latency** | WebSocket-powered sync with near-instant broadcast |
| 🌐 **Zero Installation** | Fully browser-based — works on any modern browser |
| 🗂️ **Multi-File Support** | Navigate and edit across multiple files in a session |
| 🎨 **Syntax Highlighting** | Clean code editor experience with language-aware highlighting |

---

## 🛠️ Tech Stack

### Frontend — `Client/`
| Technology | Purpose |
|---|---|
| **React.js** | UI framework and component architecture |
| **Tailwind CSS** | Utility-first styling |
| **WebSocket (native)** | Real-time bidirectional communication with server |
| **WebRTC** | Peer-to-peer video/audio streaming |

### Backend — `Server/`
| Technology | Purpose |
|---|---|
| **Node.js** | Server runtime |
| **Express.js** | HTTP server and API routing |
| **MongoDB** | Session and room data persistence |
| **WebSocket (ws)** | Broadcasting code changes and cursor events to all clients |
| **WebRTC Signaling** | Coordinating peer connections for video calls |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                       │
│                                                             │
│   ┌─────────────┐   ┌──────────────┐   ┌───────────────┐  │
│   │  Code Editor │   │ Cursor Sync  │   │  Video Call   │  │
│   │  (Monaco)    │   │  (WebSocket) │   │   (WebRTC)    │  │
│   └──────┬───────┘   └──────┬───────┘   └───────┬───────┘  │
│          └─────────────────┼───────────────────┘           │
│                            │ WebSocket                      │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    SERVER (Node.js + Express)                │
│                                                             │
│   ┌──────────────────┐        ┌─────────────────────────┐  │
│   │  WebSocket Server │        │   WebRTC Signaling      │  │
│   │  (Room Manager)   │        │   (Offer/Answer/ICE)    │  │
│   └─────────┬─────────┘        └────────────┬────────────┘  │
│             │                               │               │
│   ┌─────────▼───────────────────────────────▼────────────┐  │
│   │                    MongoDB                            │  │
│   │          (Rooms, Sessions, User State)                │  │
│   └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) v18+
- [npm](https://npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas URI)

---

### 1. Clone the Repository

```bash
git clone https://github.com/SohamBhattacharjee2003/syncide-websocket-ide.git
cd syncide-websocket-ide
```

---

### 2. Setup the Server

```bash
cd Server
npm install
```

Create a `.env` file inside `Server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

---

### 3. Setup the Client

```bash
cd ../Client
npm install
```

Create a `.env` file inside `Client/`:

```env
VITE_SERVER_URL=http://localhost:5000
```

Start the client:

```bash
npm run dev
```

---

### 4. Open in Browser

Visit `http://localhost:5173`, create a room, share the room link with a collaborator, and start coding together in real time.

---

## 📁 Project Structure

```
syncide-websocket-ide/
│
├── Client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Editor, VideoCall, Sidebar components
│   │   ├── hooks/           # Custom WebSocket and WebRTC hooks
│   │   ├── pages/           # Room and Landing pages
│   │   └── App.jsx
│   └── package.json
│
├── Server/                  # Node.js backend
│   ├── routes/              # Express API routes
│   ├── socket/              # WebSocket room and event handlers
│   ├── models/              # MongoDB schemas
│   ├── index.js             # Entry point
│   └── package.json
│
├── test-video-call.sh       # WebRTC connection test script
└── README.md
```

---

## 🔄 How Real-Time Sync Works

1. A user joins or creates a **room** — identified by a unique Room ID.
2. Every **keystroke** is captured by the editor and emitted to the server via WebSocket.
3. The server **broadcasts** the change to all other clients in that room.
4. Each client applies the received **delta** to their local editor state.
5. **Cursor positions** follow the same broadcast pattern, rendered as colored markers for each user.

## 📹 How Video Calling Works

1. When a user enables video, the client initiates a **WebRTC handshake** via the server (signaling).
2. The server exchanges **SDP Offer/Answer** and **ICE candidates** between peers.
3. Once connected, audio/video streams directly **peer-to-peer** — the server is no longer in the media path.
4. This keeps video latency low and server bandwidth usage minimal.

---

## 🌐 Live Demo

> 🔗 [https://syncide-websocket-ide.vercel.app](https://syncide-websocket-ide.vercel.app)

Open two browser tabs, join the same room, and watch your edits sync in real time.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

Please follow conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`).

---

## 👨‍💻 Author

**Soham Bhattacharjee**
- 🌐 [LinkedIn](https://www.linkedin.com/in/sohambhattacharjee84)
- 🐙 [GitHub](https://github.com/SohamBhattacharjee2003)
- 📧 sohambhattacharjee84@gmail.com

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

---

<div align="center">

⭐ **If you found this useful, consider giving it a star!** ⭐

*Built with ❤️ by Soham Bhattacharjee*

</div>
