import { motion } from 'framer-motion';
import { languages } from '../../constants';

// Explorer Panel Component
export default function ExplorerPanel({ 
  files, 
  folders, 
  activeFileId, 
  onOpenFile, 
  onDeleteItem, 
  onNewFile, 
  onNewFolder, 
  onContextMenu 
}) {
  return (
    <>
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider border-b border-[#1e1e24]">
        <span>Files</span>
        <div className="flex gap-1">
          <button
            onClick={onNewFile}
            className="p-1 hover:bg-[#1e1e24] rounded"
            title="New File"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15h6"/>
            </svg>
          </button>
          <button
            onClick={onNewFolder}
            className="p-1 hover:bg-[#1e1e24] rounded"
            title="New Folder"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><path d="M12 11v6M9 14h6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Folders & Files List */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Folders */}
        {folders.map(folder => (
          <div
            key={folder.id}
            className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-gray-400 hover:bg-[#1a1a1f] hover:text-gray-200 group"
            onContextMenu={(e) => onContextMenu(e, folder)}
          >
            <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 6a2 2 0 012-2h5l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"/>
            </svg>
            <span className="text-sm truncate flex-1">{folder.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteItem(folder.id); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
              title="Delete Folder"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        ))}
        
        {/* Files */}
        {files.map(file => {
          const isActive = file.id === activeFileId;
          const lang = languages[file.language];

          return (
            <motion.div
              key={file.id}
              className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none group transition-colors ${
                isActive ? "bg-[#1e1e24] text-white" : "text-gray-400 hover:bg-[#1a1a1f] hover:text-gray-200"
              }`}
              onClick={() => onOpenFile(file)}
              onContextMenu={(e) => onContextMenu(e, file)}
              whileHover={{ x: 2 }}
            >
              <div 
                className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{ backgroundColor: lang?.color || "#666" }}
              >
                {lang?.icon || "F"}
              </div>
              <span className="text-sm truncate flex-1">{file.name}</span>
              
              {files.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteItem(file.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                  title="Delete File"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
