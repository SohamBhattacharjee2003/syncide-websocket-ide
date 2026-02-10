import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import { languages } from '../../constants';

// New File Modal Component
export default function NewFileModal({ isOpen, onClose, onCreate }) {
  const [fileName, setFileName] = useState("");

  const handleCreate = (lang = "javascript") => {
    if (fileName.trim() || lang) {
      onCreate(fileName, lang);
      setFileName("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Modal onClose={onClose}>
        <div className="p-4 border-b border-[#2a2a32]">
          <h3 className="text-white font-medium">New File</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-gray-400 text-xs block mb-2">File Name</label>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="filename.js"
              className="w-full bg-[#0d0d0f] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-2">Language</label>
            <div className="grid grid-cols-5 gap-1.5">
              {Object.values(languages).slice(0, 10).map(lang => (
                <button
                  key={lang.id}
                  onClick={() => handleCreate(lang.id)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg border border-[#2a2a32] hover:border-emerald-500/40 hover:bg-[#1e1e24] transition-all"
                >
                  <div className="w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: lang.color }}>{lang.icon.charAt(0)}</div>
                  <span className="text-[9px] text-gray-400">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3 bg-[#0d0d0f] flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">Cancel</button>
          <button onClick={() => handleCreate()} className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg">Create</button>
        </div>
      </Modal>
    </AnimatePresence>
  );
}
