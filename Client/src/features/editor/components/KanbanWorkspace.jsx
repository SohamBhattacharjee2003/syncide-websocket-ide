import { useState, useEffect } from "react";

// Kanban / Tasks Workspace — persists to localStorage keyed by workspaceId
export default function KanbanWorkspace({ workspaceId }) {
  const storageKey = `syncide_kanban_${workspaceId || "global"}`;
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskColumn, setNewTaskColumn] = useState("todo");

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setTasks(JSON.parse(saved));
      } else {
        setTasks([
          { id: 1, title: "Set up project structure", status: "done", priority: "high" },
          { id: 2, title: "Implement authentication", status: "in-progress", priority: "high" },
          { id: 3, title: "Write unit tests", status: "todo", priority: "medium" },
        ]);
      }
    } catch (_) {
      setTasks([]);
    }
  }, [storageKey]);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, storageKey]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks(prev => [
      ...prev,
      { id: Date.now(), title: newTaskTitle.trim(), status: newTaskColumn, priority: "medium" },
    ]);
    setNewTaskTitle("");
  };

  const moveTask = (taskId, direction) => {
    const flow = ["todo", "in-progress", "done"];
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const idx = flow.indexOf(t.status);
      const next = direction === "forward" ? Math.min(idx + 1, flow.length - 1) : Math.max(idx - 1, 0);
      return { ...t, status: flow[next] };
    }));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const columns = [
    { id: "todo", title: "To Do", color: "#6b7280", dotColor: "bg-gray-400" },
    { id: "in-progress", title: "In Progress", color: "#f59e0b", dotColor: "bg-yellow-400" },
    { id: "done", title: "Done", color: "#10b981", dotColor: "bg-emerald-400" },
  ];

  const priorityColors = { high: "text-red-400", medium: "text-yellow-400", low: "text-emerald-400" };

  return (
    <div className="h-full bg-[#0d0d0f] flex flex-col">
      {/* Header */}
      <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <span className="text-lg">📋</span>
          </div>
          <span className="text-white font-medium">Project Tasks</span>
          <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
            {tasks.length} tasks
          </span>
        </div>
      </div>

      {/* Add Task Input */}
      <div className="px-4 py-2.5 bg-[#111114] border-b border-[#2a2a32] flex gap-2 shrink-0">
        <select
          value={newTaskColumn}
          onChange={(e) => setNewTaskColumn(e.target.value)}
          className="bg-[#0d0d0f] border border-[#2a2a32] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
        >
          {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="New task title... press Enter"
          className="flex-1 bg-[#0d0d0f] border border-[#2a2a32] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
        />
        <button
          onClick={addTask}
          disabled={!newTaskTitle.trim()}
          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-colors font-medium"
        >
          + Add
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 flex gap-3 p-4 overflow-x-auto min-h-0">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex-1 min-w-[240px] bg-[#111114] rounded-xl border border-[#2a2a32] flex flex-col">
              {/* Column Header */}
              <div className="p-3 border-b border-[#2a2a32] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="text-white font-medium text-sm">{col.title}</span>
                </div>
                <span className="text-xs text-gray-500 bg-[#1e1e24] px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>

              {/* Tasks */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-[#1a1a1f] rounded-lg p-3 border border-[#2a2a32] hover:border-blue-500/30 transition-all group"
                  >
                    <p className={`text-sm mb-2 ${col.id === "done" ? "line-through text-gray-500" : "text-white"}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-medium ${priorityColors[task.priority] || "text-white/40"}`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {col.id !== "todo" && (
                          <button
                            onClick={() => moveTask(task.id, "backward")}
                            className="text-[10px] text-gray-400 hover:text-white px-1.5 py-0.5 hover:bg-white/10 rounded transition-colors"
                            title="Move back"
                          >← </button>
                        )}
                        {col.id !== "done" && (
                          <button
                            onClick={() => moveTask(task.id, "forward")}
                            className="text-[10px] text-blue-400 hover:text-blue-300 px-1.5 py-0.5 hover:bg-blue-500/10 rounded transition-colors"
                            title="Move forward"
                          > →</button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-[10px] text-red-400/60 hover:text-red-400 px-1.5 py-0.5 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete"
                        >✕</button>
                      </div>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-6 text-gray-600 text-xs">
                    No tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
