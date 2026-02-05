// Figma Design Workspace Component
export default function FigmaWorkspace() {
  return (
    <div className="h-full bg-[#1a1a1f] flex flex-col">
      {/* Figma Toolbar */}
      <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-lg">🎨</span>
            </div>
            <span className="text-white font-medium">Design Canvas</span>
          </div>
          <div className="h-6 w-px bg-[#2a2a32]" />
          <div className="flex gap-1">
            {["Select", "Frame", "Rectangle", "Ellipse", "Text", "Pen"].map(tool => (
              <button key={tool} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">
                {tool}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">100%</span>
          <button className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
            Export
          </button>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "repeating-conic-gradient(#1e1e24 0% 25%, #111114 0% 50%) 50% / 20px 20px" }}>
        {/* Sample Design Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-white rounded-2xl shadow-2xl p-6">
          <div className="w-full h-8 bg-gray-100 rounded-lg mb-4" />
          <div className="flex gap-4 mb-4">
            <div className="w-24 h-24 bg-purple-100 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-purple-500 rounded-lg" />
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
        
        {/* Right Sidebar - Properties */}
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-[#111114] border-l border-[#2a2a32] p-4">
          <h3 className="text-white text-sm font-medium mb-4">Properties</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value="200" className="bg-[#0d0d0f] border border-[#2a2a32] rounded px-2 py-1 text-xs text-white" readOnly />
                <input type="text" value="150" className="bg-[#0d0d0f] border border-[#2a2a32] rounded px-2 py-1 text-xs text-white" readOnly />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Size</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value="400" className="bg-[#0d0d0f] border border-[#2a2a32] rounded px-2 py-1 text-xs text-white" readOnly />
                <input type="text" value="300" className="bg-[#0d0d0f] border border-[#2a2a32] rounded px-2 py-1 text-xs text-white" readOnly />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fill</label>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white border border-[#2a2a32]" />
                <span className="text-xs text-gray-400">#FFFFFF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
