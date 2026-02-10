// Search Panel Component
export default function SearchPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-9 flex items-center px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider border-b border-[#1e1e24] gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        Search
      </div>
      <div className="p-3">
        <input
          type="text"
          placeholder="Search in files..."
          className="w-full bg-[#0d0d0f] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
        />
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input type="checkbox" className="rounded bg-[#1e1e24] border-[#2a2a32]" />
            Match case
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input type="checkbox" className="rounded bg-[#1e1e24] border-[#2a2a32]" />
            Regex
          </label>
        </div>
      </div>
      <div className="flex-1 p-3 pt-0">
        <p className="text-xs text-gray-500 text-center mt-8">Type to search across all files</p>
      </div>
    </div>
  );
}
