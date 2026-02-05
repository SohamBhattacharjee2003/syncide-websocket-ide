// Git Panel Component
export default function GitPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-9 flex items-center px-3 text-[11px] font-medium text-orange-500 uppercase tracking-wider border-b border-[#1e1e24] gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 009 9"/>
        </svg>
        Source Control
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-white">main</span>
          <span className="text-xs text-gray-500 ml-auto">synced</span>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase">Changes (1)</p>
          <div className="flex items-center gap-2 p-2 bg-[#1e1e24] rounded-lg">
            <span className="text-xs text-green-400">M</span>
            <span className="text-sm text-gray-300">main.js</span>
          </div>
        </div>
        <textarea
          placeholder="Commit message..."
          className="w-full mt-3 bg-[#0d0d0f] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none resize-none h-16"
        />
        <button className="w-full mt-2 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors">
          Commit
        </button>
      </div>
    </div>
  );
}
