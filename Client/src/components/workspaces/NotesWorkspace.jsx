import { useState } from 'react';

// Notes Workspace Component
export default function NotesWorkspace() {
  const [notes, setNotes] = useState("# Project Notes\n\nAdd your notes here...");

  return (
    <div className="h-full bg-[#0d0d0f] flex flex-col">
      <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <span className="text-lg">📝</span>
          </div>
          <span className="text-white font-medium">Project Notes</span>
        </div>
        <div className="flex gap-2 text-xs">
          <button className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">Bold</button>
          <button className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">Italic</button>
          <button className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">List</button>
          <button className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors">Save</button>
        </div>
      </div>
      <div className="flex-1 p-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-full bg-[#111114] border border-[#2a2a32] rounded-xl p-6 text-gray-300 resize-none focus:outline-none focus:border-yellow-500/50 font-mono text-sm leading-relaxed"
          placeholder="Write your notes here... Supports Markdown!"
        />
      </div>
    </div>
  );
}
