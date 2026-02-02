import Editor from "@monaco-editor/react";

export default function EditorPane({ code, onCodeChange }) {
  return (
    <div style={{ flex: 3 }}>
      <Editor
        height="100%"
        language="javascript"
        theme="vs-dark"
        value={code}
        onChange={onCodeChange}
      />
    </div>
  );
}
