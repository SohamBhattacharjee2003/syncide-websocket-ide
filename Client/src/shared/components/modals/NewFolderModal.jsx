import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Modal from './Modal';

// New Folder Modal Component
export default function NewFolderModal({ isOpen, onClose, onCreate }) {
  const [folderName, setFolderName] = useState("");

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreate(folderName);
      setFolderName("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Modal onClose={onClose}>
        <div className="p-4 border-b border-[#2a2a32]">
          <h3 className="text-white font-medium">New Folder</h3>
        </div>
        <div className="p-4">
          <label className="text-gray-400 text-xs block mb-2">Folder Name</label>
          <input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="folder-name"
            className="w-full bg-[#0d0d0f] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>
        <div className="p-3 bg-[#0d0d0f] flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">Cancel</button>
          <button onClick={handleCreate} className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg">Create</button>
        </div>
      </Modal>
    </AnimatePresence>
  );
}
