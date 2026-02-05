import { useState } from 'react';

// AI Copilot Workspace Component
export default function AIWorkspace() {
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI coding assistant. How can I help you today?" }
  ]);
  const [aiInput, setAiInput] = useState("");

  const handleSendMessage = () => {
    if (aiInput.trim()) {
      setAiMessages([...aiMessages, { role: "user", content: aiInput }]);
      setAiInput("");
      setTimeout(() => {
        setAiMessages(prev => [...prev, { 
          role: "assistant", 
          content: "I'm analyzing your request... This is a demo response. In production, this would connect to an AI API like OpenAI GPT-4 or Claude for intelligent code assistance." 
        }]);
      }, 500);
    }
  };

  const handleQuickAction = (action) => {
    setAiMessages([...aiMessages, { role: "user", content: action }]);
    setTimeout(() => {
      setAiMessages(prev => [...prev, { 
        role: "assistant", 
        content: `I'd be happy to help ${action.toLowerCase()}! Please share the code you'd like me to analyze, or I can work with the currently open file in the editor.` 
      }]);
    }, 500);
  };

  return (
    <div className="h-full bg-[#0d0d0f] flex flex-col">
      {/* AI Header */}
      <div className="h-14 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h2 className="text-white font-semibold">AI Copilot</h2>
            <p className="text-xs text-gray-500">Powered by Advanced AI</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setAiMessages([{ role: "assistant", content: "Hi! I'm your AI coding assistant. How can I help you today?" }])}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded-lg transition-colors"
          >
            Clear Chat
          </button>
          <button className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
            New Chat
          </button>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {aiMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] ${msg.role === "user" ? "order-2" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs">🤖</div>
                  <span className="text-xs text-gray-500">AI Copilot</span>
                </div>
              )}
              <div className={`rounded-2xl px-4 py-3 ${
                msg.role === "user" 
                  ? "bg-emerald-600 text-white rounded-tr-md" 
                  : "bg-[#1e1e24] text-gray-300 border border-[#2a2a32] rounded-tl-md"
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="px-6 py-3 border-t border-[#1e1e24] bg-[#111114]">
        <div className="flex flex-wrap gap-2 mb-3">
          {["Explain this code", "Find bugs", "Optimize performance", "Write tests", "Add documentation", "Refactor code"].map(q => (
            <button
              key={q}
              onClick={() => handleQuickAction(q)}
              className="px-3 py-1.5 text-xs bg-[#1e1e24] hover:bg-[#2a2a32] text-gray-400 hover:text-white rounded-full border border-[#2a2a32] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-[#2a2a32]">
        <div className="flex gap-3">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask anything about your code..."
            className="flex-1 bg-[#1e1e24] border border-[#2a2a32] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl transition-all font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
