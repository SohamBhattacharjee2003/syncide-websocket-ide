import { useState } from 'react';

// Kanban / Tasks Workspace Component
export default function KanbanWorkspace() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Fix auth bug", status: "in-progress", assignee: "EW" },
    { id: 2, title: "Add user validation", status: "todo", assignee: "JC" },
    { id: 3, title: "Write unit tests", status: "done", assignee: "Y" },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const addTask = () => {
    if (newTaskTitle.trim()) {
      setTasks([...tasks, { id: Date.now(), title: newTaskTitle, status: "todo", assignee: "You" }]);
      setNewTaskTitle("");
    }
  };

  const moveTask = (taskId, currentStatus) => {
    const nextStatus = currentStatus === "todo" ? "in-progress" : "done";
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
  };

  return (
    <div className="h-full bg-[#0d0d0f] flex flex-col">
      {/* Kanban Header */}
      <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <span className="text-lg">📋</span>
          </div>
          <span className="text-white font-medium">Project Tasks</span>
        </div>
        <button 
          onClick={addTask}
          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          + Add Task
        </button>
      </div>
      
      {/* Add Task Input */}
      <div className="px-4 py-3 bg-[#111114] border-b border-[#2a2a32]">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Type a task and press Enter..."
          className="w-full bg-[#0d0d0f] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
        />
      </div>
      
      {/* Kanban Columns */}
      <div className="flex-1 flex gap-4 p-4 overflow-x-auto">
        {[
          { id: "todo", title: "To Do", color: "gray" },
          { id: "in-progress", title: "In Progress", color: "yellow" },
          { id: "done", title: "Done", color: "green" },
        ].map(column => (
          <div key={column.id} className="flex-1 min-w-[280px] bg-[#111114] rounded-xl border border-[#2a2a32] flex flex-col">
            <div className="p-3 border-b border-[#2a2a32] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-${column.color}-500`} />
                <span className="text-white font-medium text-sm">{column.title}</span>
              </div>
              <span className="text-xs text-gray-500 bg-[#1e1e24] px-2 py-0.5 rounded">
                {tasks.filter(t => t.status === column.id).length}
              </span>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {tasks.filter(t => t.status === column.id).map(task => (
                <div key={task.id} className="bg-[#1a1a1f] rounded-lg p-3 border border-[#2a2a32] hover:border-blue-500/30 transition-colors cursor-pointer group">
                  <p className={`text-sm ${column.id === "done" ? "line-through text-gray-500" : "text-white"}`}>{task.title}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">#{task.id}</span>
                    <div className="flex items-center gap-2">
                      {column.id !== "done" && (
                        <button 
                          onClick={() => moveTask(task.id, column.id)}
                          className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Move →
                        </button>
                      )}
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[8px] text-white font-bold">
                        {task.assignee.charAt(0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
