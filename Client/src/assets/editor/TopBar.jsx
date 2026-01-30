export default function TopBar({ roomId, setRoomId, joinRoom }) {
  return (
    <div
      style={{
        height: "50px",
        background: "#1e1e1e",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
      }}
    >
      <strong>SyncIDE</strong>

      <div>
        <input
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <button onClick={joinRoom}>Join</button>
      </div>
    </div>
  );
}
