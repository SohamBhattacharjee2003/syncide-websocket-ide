import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";

export const useCodeSync = () => {
  const [roomId, setRoomId] = useState("");
  const [code, setCode] = useState("");
  const saveTimeout = useRef(null);

  useEffect(() => {
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
  };

  const onCodeChange = (value) => {
    if (!value) return;

    setCode(value);

    // fast sync
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

  return {
    roomId,
    setRoomId,
    code,
    joinRoom,
    onCodeChange,
  };
};
