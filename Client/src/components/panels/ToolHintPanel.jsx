import { toolTabs } from '../../constants';

// Tool Hint Panel - Shows when a tool is opened in main workspace
export default function ToolHintPanel({ activePanel }) {
  return (
    <div className="flex flex-col h-full items-center justify-center p-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-[#1e1e24] flex items-center justify-center text-2xl mb-3">
        {activePanel === "ai" && "🤖"}
        {activePanel === "figma" && "🎨"}
        {activePanel === "whiteboard" && "✏️"}
        {activePanel === "kanban" && "📋"}
        {activePanel === "notes" && "📝"}
        {activePanel === "snippets" && "💻"}
        {activePanel === "api" && "⚡"}
      </div>
      <p className="text-white font-medium mb-1">
        {toolTabs[activePanel]?.name}
      </p>
      <p className="text-xs text-gray-500 mb-4">
        Opened in main workspace
      </p>
      <p className="text-xs text-gray-600">
        Switch to the tab above to view
      </p>
    </div>
  );
}
