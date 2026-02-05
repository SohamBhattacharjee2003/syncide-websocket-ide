// Snippets Workspace Component
export default function SnippetsWorkspace({ onInsertSnippet }) {
  const snippets = [
    { id: 1, name: "Console Log", code: "console.log($1);", language: "javascript" },
    { id: 2, name: "Arrow Function", code: "const $1 = ($2) => {\n  $3\n};", language: "javascript" },
    { id: 3, name: "React Component", code: "const $1 = () => {\n  return (\n    <div>\n      $2\n    </div>\n  );\n};", language: "javascript" },
    { id: 4, name: "Async Function", code: "async function $1() {\n  try {\n    $2\n  } catch (error) {\n    console.error(error);\n  }\n}", language: "javascript" },
    { id: 5, name: "For Loop", code: "for (let i = 0; i < $1; i++) {\n  $2\n}", language: "javascript" },
    { id: 6, name: "If Statement", code: "if ($1) {\n  $2\n}", language: "javascript" },
  ];

  return (
    <div className="h-full bg-[#0d0d0f] flex flex-col">
      <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <span className="text-lg">💻</span>
          </div>
          <span className="text-white font-medium">Code Snippets Library</span>
        </div>
        <button className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors">
          + New Snippet
        </button>
      </div>
      <div className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-y-auto">
        {snippets.map(snippet => (
          <div 
            key={snippet.id} 
            className="bg-[#111114] rounded-xl border border-[#2a2a32] hover:border-cyan-500/30 transition-colors cursor-pointer group overflow-hidden"
            onClick={() => onInsertSnippet && onInsertSnippet(snippet.code)}
          >
            <div className="p-4 border-b border-[#2a2a32]">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">{snippet.name}</h3>
                <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">{snippet.language}</span>
              </div>
            </div>
            <pre className="p-4 text-xs text-gray-400 font-mono bg-[#0a0a0c] overflow-x-auto">
              {snippet.code}
            </pre>
            <div className="p-3 bg-[#111114] border-t border-[#2a2a32] flex items-center justify-between">
              <span className="text-xs text-gray-500">Click to insert into editor</span>
              <button className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Insert →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
