import { useEffect, useState } from "react";
import socket from "./socket";
import Editor from "@monaco-editor/react";

function App() {
  const [roomId, setRoomId] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off("code-update");
    };
  }, []);

  const joinRoom = () => {
    if (!roomId) return;
    socket.emit("join-room", roomId);
    console.log("Joined room:", roomId);
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

    socket.emit("code-change", {
      roomId,
      code: newCode,
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>SyncIDE – Live Code Sync</h2>

      <input
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={joinRoom} style={{ marginLeft: "1rem" }}>
        Join
      </button>

      <br />
      <br />

      <Editor
        height="70vh"
        language="javascript"
        theme="vs-dark"
        value={code}
        onChange={(value) => {
          setCode(value);
          socket.emit("code-change", {
            roomId,
            code: value,
          });
        }}
      />
    </div>
  );
}

export default App;
