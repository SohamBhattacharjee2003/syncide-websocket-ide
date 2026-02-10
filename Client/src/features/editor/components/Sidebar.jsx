import { motion } from "framer-motion";
import { useState } from "react";
import {
  VscFiles,
  VscSearch,
  VscSourceControl,
  VscExtensions,
  VscSettingsGear,
  VscAccount,
  VscDebugAlt,
  VscRemote,
} from "react-icons/vsc";

const sidebarItems = [
  { icon: VscFiles, label: "Explorer", id: "explorer" },
  { icon: VscSearch, label: "Search", id: "search" },
  { icon: VscSourceControl, label: "Source Control", id: "git" },
  { icon: VscDebugAlt, label: "Run & Debug", id: "debug" },
  { icon: VscExtensions, label: "Extensions", id: "extensions" },
];

const bottomItems = [
  { icon: VscAccount, label: "Account", id: "account" },
  { icon: VscSettingsGear, label: "Settings", id: "settings" },
];

export default function Sidebar({ activeTab, onTabChange }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-12 md:w-14 bg-[#0a0a0a] border-r border-white/5 flex flex-col items-center py-2 relative z-20"
    >
      {/* Top Items */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => onTabChange(item.id)}
              className={`
                relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg
                transition-all duration-200 group
                ${isActive 
                  ? "text-emerald-400 bg-emerald-500/10" 
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-r-full"
                />
              )}

              <Icon className="w-5 h-5 md:w-6 md:h-6" />

              {/* Tooltip */}
              {hoveredItem === item.id && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50 hidden md:block"
                >
                  {item.label}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Connection Status */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="mb-2"
      >
        <div className="relative group cursor-pointer">
          <VscRemote className="w-5 h-5 text-emerald-400" />
          <motion.div
            className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            Connected
          </div>
        </div>
      </motion.div>

      {/* Bottom Items */}
      <div className="flex flex-col items-center gap-1 pt-2 border-t border-white/5">
        {bottomItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => onTabChange(item.id)}
              className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-all duration-200"
            >
              <Icon className="w-5 h-5 md:w-6 md:h-6" />

              {/* Tooltip */}
              {hoveredItem === item.id && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50 hidden md:block"
                >
                  {item.label}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.aside>
  );
}
