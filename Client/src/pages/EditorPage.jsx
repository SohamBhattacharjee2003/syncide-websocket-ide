import { useParams } from "react-router-dom";
import { useEffect } from "react";
import Editor from "@monaco-editor/react";
import socket from "../socket/socket";
import { useRef, useState } from "react";

export default function EditorPage() {
  const { roomId } = useParams(); // 👈 from URL
  const [code, setCode] = useState("");
  const saveTimeout = useRef(null);

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off("code-update");
    };
  }, [roomId]);

  const handleCodeChange = (value) => {
    if (!value) return;

    setCode(value);

    // real-time sync
    socket.emit("code-change", {
      roomId,
      code: value,
    });

    // debounced save
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(() => {
      socket.emit("save-code", {
        roomId,
        code: value,
      });
    }, 1000);
  };

  return (
    <div className="h-screen bg-neutral-950">
      <Editor
        height="100%"
        theme="vs-dark"
        language="javascript"
        value={code}
        onChange={handleCodeChange}
      />
    </div>
  );
}
