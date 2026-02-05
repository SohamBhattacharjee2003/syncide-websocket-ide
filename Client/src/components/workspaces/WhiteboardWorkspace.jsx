// Whiteboard Workspace Component
export default function WhiteboardWorkspace() {
  return (
    <div className="h-full bg-[#1a1a1f] flex flex-col">
      {/* Whiteboard Toolbar */}
      <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <span className="text-lg">✏️</span>
            </div>
            <span className="text-white font-medium">Whiteboard</span>
          </div>
          <div className="h-6 w-px bg-[#2a2a32]" />
          <div className="flex gap-1 bg-[#0d0d0f] rounded-lg p-1">
            {[
              { icon: "✏️", name: "Pen" },
              { icon: "🖌️", name: "Brush" },
              { icon: "⬜", name: "Rectangle" },
              { icon: "⭕", name: "Circle" },
              { icon: "📝", name: "Text" },
              { icon: "🗑️", name: "Eraser" },
            ].map(tool => (
              <button key={tool.name} className="p-2 text-lg hover:bg-[#2a2a32] rounded transition-colors" title={tool.name}>
                {tool.icon}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ffffff"].map(color => (
              <button key={color} className="w-6 h-6 rounded-full border-2 border-[#2a2a32] hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">
            Clear All
          </button>
          <button className="px-3 py-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors">
            Save
          </button>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 relative cursor-crosshair" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 19px, #1e1e24 19px, #1e1e24 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #1e1e24 19px, #1e1e24 20px)" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🎨</div>
            <p className="text-gray-500">Click and drag to draw</p>
            <p className="text-gray-600 text-sm mt-1">All team members can see your drawings in real-time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
