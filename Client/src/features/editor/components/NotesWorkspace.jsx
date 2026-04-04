import { useState, useEffect, useCallback } from "react";

// Notes Workspace — persists to localStorage keyed by workspaceId
export default function NotesWorkspace({ workspaceId }) {
  const storageKey = `syncide_notes_${workspaceId || "global"}`;
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [activeFormat, setActiveFormat] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setNotes(saved !== null ? saved : "# Project Notes\n\nAdd your notes here...\n\n## Tasks\n- [ ] \n\n## Ideas\n\n");
  }, [storageKey]);

  // Auto-save debounced
  useEffect(() => {
    if (!isSaved) {
      const timer = setTimeout(() => {
        localStorage.setItem(storageKey, notes);
        setIsSaved(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [notes, isSaved, storageKey]);

  const handleChange = (e) => {
    setNotes(e.target.value);
    setIsSaved(false);
  };

  const insertText = (prefix, suffix = "") => {
    const textarea = document.getElementById("notes-textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = notes.slice(start, end);
    const newText = notes.slice(0, start) + prefix + selected + suffix + notes.slice(end);
    setNotes(newText);
    setIsSaved(false);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  const formatButtons = [
    { label: "B", action: () => insertText("**", "**"), title: "Bold" },
    { label: "I", action: () => insertText("*", "*"), title: "Italic" },
    { label: "H1", action: () => insertText("\n# "), title: "Heading 1" },
    { label: "H2", action: () => insertText("\n## "), title: "Heading 2" },
    { label: "─", action: () => insertText("\n- "), title: "List item" },
    { label: "☐", action: () => insertText("\n- [ ] "), title: "Checkbox" },
    { label: "```", action: () => insertText("\n```\n", "\n```\n"), title: "Code block" },
  ];

  return (
    <div className="h-full bg-[#0d0d0f] flex flex-col">
      {/* Header */}
      <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <span className="text-lg">📝</span>
          </div>
          <span className="text-white font-medium">Project Notes</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSaved ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
            {isSaved ? "Saved" : "Saving..."}
          </span>
        </div>
        <div className="flex gap-1">
          {formatButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              title={btn.title}
              className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors font-mono"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 overflow-hidden">
        <textarea
          id="notes-textarea"
          value={notes}
          onChange={handleChange}
          className="w-full h-full bg-[#111114] border border-[#2a2a32] rounded-xl p-6 text-gray-300 resize-none focus:outline-none focus:border-yellow-500/50 font-mono text-sm leading-relaxed"
          placeholder="Write your notes here... Supports Markdown!"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
