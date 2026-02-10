// API Tester Workspace Component
export default function APIWorkspace() {
  return (
    <div className="h-full bg-[#0d0d0f] flex flex-col">
      <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <span className="text-white font-medium">API Tester</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">
            History
          </button>
          <button className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">
            Collections
          </button>
        </div>
      </div>
      <div className="flex-1 flex">
        {/* Request Panel */}
        <div className="flex-1 border-r border-[#2a2a32] flex flex-col">
          <div className="p-4 border-b border-[#2a2a32]">
            <div className="flex gap-2">
              <select className="bg-[#1e1e24] border border-[#2a2a32] rounded-lg px-3 py-2.5 text-sm text-green-400 focus:outline-none font-medium">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
                <option>PATCH</option>
              </select>
              <input
                type="text"
                placeholder="https://api.example.com/users"
                className="flex-1 bg-[#1e1e24] border border-[#2a2a32] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
              />
              <button className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium">
                Send
              </button>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex border-b border-[#2a2a32]">
              {["Params", "Headers", "Body", "Auth"].map(tab => (
                <button key={tab} className="px-4 py-2 text-sm text-gray-500 hover:text-white border-b-2 border-transparent hover:border-pink-500 transition-colors">
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex-1 p-4">
              <textarea
                placeholder='{"key": "value"}'
                className="w-full h-full bg-[#111114] border border-[#2a2a32] rounded-lg p-4 text-sm text-gray-300 resize-none focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>
        
        {/* Response Panel */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-[#2a2a32] flex items-center justify-between">
            <span className="text-white font-medium">Response</span>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-green-400">200 OK</span>
              <span className="text-gray-500">245ms</span>
              <span className="text-gray-500">1.2 KB</span>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <pre className="text-sm text-gray-300 font-mono">
{`{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    ]
  },
  "message": "Users fetched successfully"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
