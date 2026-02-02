import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  VscAccount,
  VscComment,
  VscFiles,
  VscChevronDown,
  VscChevronRight,
  VscFile,
  VscFolder,
  VscFolderOpened,
  VscSend,
  VscCircleFilled,
} from "react-icons/vsc";
import UserAvatar from "./UserAvatar";

const TabButton = ({ active, icon: Icon, label, count, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`
      flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium
      border-b-2 transition-all duration-200
      ${active 
        ? "text-emerald-400 border-emerald-400 bg-emerald-500/5" 
        : "text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-white/5"
      }
    `}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden lg:inline">{label}</span>
    {count > 0 && (
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
        active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-neutral-400"
      }`}>
        {count}
      </span>
    )}
  </motion.button>
);

const FileTreeItem = ({ name, type, level = 0, isOpen, onToggle }) => {
  const [hovered, setHovered] = useState(false);
  const isFolder = type === "folder";
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        flex items-center gap-2 py-1.5 px-2 cursor-pointer
        hover:bg-white/5 rounded-md transition-colors
        ${hovered ? "bg-white/5" : ""}
      `}
      style={{ paddingLeft: `${level * 12 + 8}px` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggle}
    >
      {isFolder ? (
        <>
          {isOpen ? (
            <VscChevronDown className="w-3 h-3 text-neutral-500" />
          ) : (
            <VscChevronRight className="w-3 h-3 text-neutral-500" />
          )}
          {isOpen ? (
            <VscFolderOpened className="w-4 h-4 text-yellow-500" />
          ) : (
            <VscFolder className="w-4 h-4 text-yellow-500" />
          )}
        </>
      ) : (
        <>
          <span className="w-3" />
          <VscFile className="w-4 h-4 text-neutral-400" />
        </>
      )}
      <span className={`text-xs ${isFolder ? "text-neutral-300" : "text-neutral-400"}`}>
        {name}
      </span>
    </motion.div>
  );
};

const ParticipantsTab = ({ users = [] }) => (
  <div className="p-3 space-y-3">
    <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
      <span>Online Now</span>
      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">
        {users.length}
      </span>
    </div>

    <div className="space-y-2">
      <AnimatePresence>
        {users.map((user, index) => (
          <motion.div
            key={user.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <UserAvatar name={user.name} index={index} size="md" isTyping={user.isTyping} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white truncate">{user.name}</span>
                {user.isHost && (
                  <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded">
                    Host
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <VscCircleFilled className="w-2 h-2 text-emerald-400" />
                {user.isTyping ? (
                  <span className="text-emerald-400">typing...</span>
                ) : (
                  <span>Active now</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
          <VscAccount className="w-10 h-10 mb-2 opacity-30" />
          <span className="text-sm">No one else is here</span>
          <span className="text-xs mt-1">Share the room ID to invite</span>
        </div>
      )}
    </div>
  </div>
);

const ChatTab = ({ messages = [], onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage?.(message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2"
            >
              <UserAvatar name={msg.user} index={index} size="sm" showStatus={false} />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-white">{msg.user}</span>
                  <span className="text-[10px] text-neutral-600">{msg.time}</span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
            <VscComment className="w-10 h-10 mb-2 opacity-30" />
            <span className="text-sm">No messages yet</span>
            <span className="text-xs mt-1">Start the conversation</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
          <motion.button
            onClick={handleSend}
            className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <VscSend className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

const FilesTab = () => {
  const [openFolders, setOpenFolders] = useState({ src: true });

  const files = [
    { name: "src", type: "folder", children: [
      { name: "components", type: "folder", children: [
        { name: "App.jsx", type: "file" },
        { name: "Editor.jsx", type: "file" },
      ]},
      { name: "index.js", type: "file" },
      { name: "styles.css", type: "file" },
    ]},
    { name: "package.json", type: "file" },
    { name: "README.md", type: "file" },
  ];

  const renderTree = (items, level = 0) => {
    return items.map((item, index) => (
      <div key={item.name + index}>
        <FileTreeItem
          name={item.name}
          type={item.type}
          level={level}
          isOpen={openFolders[item.name]}
          onToggle={() => {
            if (item.type === "folder") {
              setOpenFolders(prev => ({ ...prev, [item.name]: !prev[item.name] }));
            }
          }}
        />
        <AnimatePresence>
          {item.children && openFolders[item.name] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {renderTree(item.children, level + 1)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ));
  };

  return (
    <div className="p-2">
      {renderTree(files)}
    </div>
  );
};

export default function RightPanel({ 
  users = [], 
  messages = [], 
  onSendMessage,
  isCollapsed = false,
  onToggleCollapse 
}) {
  const [activeTab, setActiveTab] = useState("participants");

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ width: 48 }}
        animate={{ width: 48 }}
        className="bg-[#0a0a0a] border-l border-white/5 flex flex-col items-center py-2 gap-2"
      >
        <motion.button
          onClick={onToggleCollapse}
          className="p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
        >
          <VscChevronRight className="w-4 h-4 rotate-180" />
        </motion.button>
        <div className="w-px h-4 bg-white/10" />
        <button className="p-2 text-neutral-500 hover:text-white rounded-lg">
          <VscAccount className="w-4 h-4" />
        </button>
        <button className="p-2 text-neutral-500 hover:text-white rounded-lg">
          <VscComment className="w-4 h-4" />
        </button>
        <button className="p-2 text-neutral-500 hover:text-white rounded-lg">
          <VscFiles className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="w-64 lg:w-72 bg-[#0a0a0a] border-l border-white/5 flex flex-col overflow-hidden"
    >
      {/* Tabs */}
      <div className="flex border-b border-white/5">
        <TabButton
          active={activeTab === "participants"}
          icon={VscAccount}
          label="Users"
          count={users.length}
          onClick={() => setActiveTab("participants")}
        />
        <TabButton
          active={activeTab === "chat"}
          icon={VscComment}
          label="Chat"
          count={messages.length}
          onClick={() => setActiveTab("chat")}
        />
        <TabButton
          active={activeTab === "files"}
          icon={VscFiles}
          label="Files"
          onClick={() => setActiveTab("files")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "participants" && (
            <motion.div
              key="participants"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full overflow-y-auto"
            >
              <ParticipantsTab users={users} />
            </motion.div>
          )}
          
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full"
            >
              <ChatTab messages={messages} onSendMessage={onSendMessage} />
            </motion.div>
          )}
          
          {activeTab === "files" && (
            <motion.div
              key="files"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full overflow-y-auto"
            >
              <FilesTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse button */}
      <div className="p-2 border-t border-white/5">
        <motion.button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-1.5 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-xs"
          whileHover={{ scale: 1.02 }}
        >
          <VscChevronRight className="w-3 h-3" />
          <span className="hidden lg:inline">Collapse</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}
