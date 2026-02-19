import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../assets/logo.png";
import { JoinRoomModal } from "../../editor/components";
import { useAuth } from "../../../shared/context/AuthContext";
import { workspaceAPI, dashboardAPI } from "../../../shared/services/api";

// ==================== MOCK DATA ====================

const activityData = [
  { name: "Mon", commits: 12, lines: 340, hours: 4.5 },
  { name: "Tue", commits: 19, lines: 580, hours: 6.2 },
  { name: "Wed", commits: 8, lines: 220, hours: 3.1 },
  { name: "Thu", commits: 25, lines: 890, hours: 7.8 },
  { name: "Fri", commits: 32, lines: 1200, hours: 8.5 },
  { name: "Sat", commits: 15, lines: 450, hours: 4.0 },
  { name: "Sun", commits: 7, lines: 180, hours: 2.3 },
];

const languageData = [
  { name: "JavaScript", value: 45, color: "#f7df1e" },
  { name: "TypeScript", value: 25, color: "#3178c6" },
  { name: "Python", value: 20, color: "#3776ab" },
  { name: "HTML/CSS", value: 10, color: "#e34c26" },
];

const recentActivity = [
  { id: 1, type: "commit", message: "Fixed authentication bug", workspace: "API Backend", time: "2 min ago", icon: "🔧" },
  { id: 2, type: "collab", message: "Sarah joined your session", workspace: "React Dashboard", time: "15 min ago", icon: "👥" },
  { id: 3, type: "create", message: "New workspace created", workspace: "Mobile App UI", time: "1 hour ago", icon: "✨" },
  { id: 4, type: "deploy", message: "Deployment successful", workspace: "API Backend", time: "3 hours ago", icon: "🚀" },
  { id: 5, type: "review", message: "Code review completed", workspace: "Python ML", time: "5 hours ago", icon: "✅" },
];

const notifications = [
  { id: 1, title: "New collaborator request", desc: "John wants to join your workspace", time: "Just now", unread: true },
  { id: 2, title: "Workspace shared", desc: "React Dashboard was shared with you", time: "1h ago", unread: true },
  { id: 3, title: "Weekly report ready", desc: "Your coding activity summary is ready", time: "2h ago", unread: false },
];

const subscriptionPlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for getting started",
    features: ["3 Workspaces", "Basic Editor", "Community Support", "1GB Storage"],
    limitations: ["No Real-time Collab", "No Analytics"],
    color: "from-gray-500 to-gray-600",
    popular: false
  },
  {
    id: "pro",
    name: "Pro",
    price: 12,
    period: "month",
    description: "Best for professionals",
    features: ["Unlimited Workspaces", "Real-time Collaboration", "Priority Support", "50GB Storage", "Advanced Analytics", "Custom Themes", "API Access"],
    limitations: [],
    color: "from-emerald-500 to-cyan-500",
    popular: true
  },
  {
    id: "team",
    name: "Team",
    price: 29,
    period: "month",
    description: "For growing teams",
    features: ["Everything in Pro", "Team Management", "Admin Dashboard", "500GB Storage", "SSO Integration", "Audit Logs", "Dedicated Support", "Custom Branding"],
    limitations: [],
    color: "from-violet-500 to-purple-600",
    popular: false
  }
];

const initialWorkspaces = [
  { id: "ws_1", name: "React Dashboard", type: "realtime", language: "javascript", lastOpened: new Date(Date.now() - 3600000).toISOString(), collaborators: 3, files: 12, color: "#10b981", starred: true, description: "Admin dashboard with charts" },
  { id: "ws_2", name: "Python ML Project", type: "plain", language: "python", lastOpened: new Date(Date.now() - 86400000).toISOString(), collaborators: 1, files: 8, color: "#3b82f6", starred: false, description: "Machine learning experiments" },
  { id: "ws_3", name: "API Backend", type: "realtime", language: "typescript", lastOpened: new Date(Date.now() - 86400000 * 3).toISOString(), collaborators: 5, files: 24, color: "#8b5cf6", starred: true, description: "Node.js REST API" },
  { id: "ws_4", name: "Mobile App UI", type: "plain", language: "javascript", lastOpened: new Date(Date.now() - 86400000 * 2).toISOString(), collaborators: 2, files: 16, color: "#f59e0b", starred: false, description: "React Native components" },
];

const sidebarItems = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "workspaces", label: "Workspaces", icon: "folder" },
  { id: "templates", label: "Templates", icon: "template" },
  { id: "activity", label: "Activity", icon: "clock" },
  { id: "subscription", label: "Subscription", icon: "credit" },
  { id: "starred", label: "Starred", icon: "star" },
];

const projectTemplates = [
  { id: 1, name: "React Dashboard", icon: "⚛️", category: "Frontend", downloads: "12.5k", color: "#61dafb" },
  { id: 2, name: "Node.js API", icon: "🟢", category: "Backend", downloads: "8.2k", color: "#68a063" },
  { id: 3, name: "Next.js Starter", icon: "▲", category: "Fullstack", downloads: "15.3k", color: "#ffffff" },
  { id: 4, name: "Python Flask", icon: "🐍", category: "Backend", downloads: "6.8k", color: "#3776ab" },
  { id: 5, name: "Vue.js App", icon: "💚", category: "Frontend", downloads: "9.1k", color: "#42b883" },
  { id: 6, name: "Express + MongoDB", icon: "🍃", category: "Fullstack", downloads: "11.2k", color: "#47a248" },
];

const teamMembers = [
  { id: 1, name: "Sarah Chen", role: "Full Stack Dev", avatar: "SC", status: "online", lastActive: "Now" },
  { id: 2, name: "Mike Johnson", role: "Backend Lead", avatar: "MJ", status: "online", lastActive: "Now" },
  { id: 3, name: "Emily Davis", role: "Frontend Dev", avatar: "ED", status: "away", lastActive: "5m ago" },
  { id: 4, name: "Alex Kim", role: "DevOps", avatar: "AK", status: "offline", lastActive: "2h ago" },
  { id: 5, name: "Jordan Lee", role: "UI Designer", avatar: "JL", status: "online", lastActive: "Now" },
];

const quickActions = [
  { id: 1, name: "New File", icon: "📄", color: "from-blue-500 to-cyan-500" },
  { id: 2, name: "Import Project", icon: "📥", color: "from-violet-500 to-purple-500" },
  { id: 3, name: "Join Session", icon: "🔗", color: "from-emerald-500 to-teal-500" },
  { id: 4, name: "Start Meeting", icon: "📹", color: "from-amber-500 to-orange-500" },
];

const codingStreaks = [
  { day: "Mon", active: true, commits: 5 },
  { day: "Tue", active: true, commits: 8 },
  { day: "Wed", active: true, commits: 3 },
  { day: "Thu", active: true, commits: 12 },
  { day: "Fri", active: true, commits: 7 },
  { day: "Sat", active: false, commits: 0 },
  { day: "Sun", active: true, commits: 4 },
];

const achievements = [
  { id: 1, name: "First Commit", icon: "🎯", unlocked: true, desc: "Made your first commit" },
  { id: 2, name: "Team Player", icon: "🤝", unlocked: true, desc: "Collaborated with 5 users" },
  { id: 3, name: "Code Machine", icon: "⚡", unlocked: true, desc: "10,000 lines of code" },
  { id: 4, name: "Night Owl", icon: "🦉", unlocked: false, desc: "Code after midnight" },
  { id: 5, name: "Speed Demon", icon: "🏎️", unlocked: false, desc: "Complete 10 tasks in a day" },
];

const upcomingTasks = [
  { id: 1, title: "Review PR #42", project: "API Backend", priority: "high", due: "Today" },
  { id: 2, title: "Fix authentication bug", project: "React Dashboard", priority: "medium", due: "Tomorrow" },
  { id: 3, title: "Update documentation", project: "Python ML", priority: "low", due: "This week" },
  { id: 4, title: "Deploy to production", project: "Mobile App", priority: "high", due: "Today" },
];

const bottomSidebarItems = [
  { id: "settings", label: "Settings", icon: "settings", path: "/settings" },
  { id: "help", label: "Help", icon: "help" },
];

// ==================== LOADING SCREEN ====================

function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");
  
  const loadingSteps = [
    "Initializing...",
    "Loading workspaces...",
    "Syncing data...",
    "Preparing dashboard...",
    "Almost ready..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 12;
        if (newProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        const stepIndex = Math.floor((newProgress / 100) * loadingSteps.length);
        setLoadingText(loadingSteps[Math.min(stepIndex, loadingSteps.length - 1)]);
        return newProgress;
      });
    }, 120);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full min-h-screen bg-[#030305] flex items-center justify-center z-50 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              background: i % 2 === 0 
                ? "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              x: [0, 30, 0, -30, 0],
              y: [0, -20, 0, 20, 0],
              scale: [1, 1.1, 1, 0.9, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Orbiting Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full border border-emerald-500/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500/50" />
        </motion.div>
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full border border-cyan-500/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500/50" />
        </motion.div>
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full border border-violet-500/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6">
        {/* Animated Logo Container */}
        <motion.div
          className="relative w-32 h-32 mx-auto mb-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Outer Glow Ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent, rgba(16,185,129,0.4), rgba(6,182,212,0.4), transparent)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner Container */}
          <div className="absolute inset-2 rounded-full bg-[#0a0a0c] flex items-center justify-center">
            <motion.img 
              src={logo} 
              alt="SyncIDE" 
              className="w-20 h-20"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Pulse Effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        
        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Sync<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">IDE</span>
          </h1>
          <p className="text-white/40">Real-time Collaborative Coding</p>
        </motion.div>
        
        {/* Progress Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-80 mx-auto"
        >
          {/* Progress Bar */}
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 rounded-full"
              style={{ backgroundSize: "200% 100%" }}
              animate={{ 
                width: `${Math.min(progress, 100)}%`,
                backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"]
              }}
              transition={{ 
                width: { duration: 0.3 },
                backgroundPosition: { duration: 2, repeat: Infinity }
              }}
            />
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          
          {/* Progress Text */}
          <div className="flex justify-between mt-3">
            <motion.span 
              className="text-sm text-white/50"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {loadingText}
            </motion.span>
            <span className="text-sm text-emerald-400 font-mono">
              {Math.min(Math.round(progress), 100)}%
            </span>
          </div>
        </motion.div>

        {/* Loading Dots */}
        <motion.div 
          className="flex justify-center gap-2 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-10 left-10 w-20 h-20 border-l-2 border-t-2 border-emerald-500/20 rounded-tl-3xl" />
      <div className="absolute top-10 right-10 w-20 h-20 border-r-2 border-t-2 border-cyan-500/20 rounded-tr-3xl" />
      <div className="absolute bottom-10 left-10 w-20 h-20 border-l-2 border-b-2 border-cyan-500/20 rounded-bl-3xl" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-r-2 border-b-2 border-emerald-500/20 rounded-br-3xl" />
    </div>
  );
}

// ==================== FUTURISTIC CHARTS ====================

// Ultra Futuristic Bar Chart with Neon Effects
function FuturisticBarChart({ data, height = 160 }) {
  const maxValue = Math.max(...data.map(d => d.commits));
  
  return (
    <div className="relative" style={{ height }}>
      {/* Background Grid */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        ))}
      </div>
      
      <div className="relative flex items-end justify-between gap-2 h-full">
        {data.map((item, i) => {
          const barHeight = (item.commits / maxValue) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                className="w-full relative rounded-t-xl overflow-visible cursor-pointer group"
                initial={{ height: 0 }}
                animate={{ height: `${barHeight}%` }}
                transition={{ duration: 1, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={{ scale: 1.08, y: -4 }}
              >
                {/* Outer Glow */}
                <motion.div
                  className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(ellipse at center, rgba(16,185,129,0.4) 0%, transparent 70%)`,
                    filter: 'blur(8px)'
                  }}
                />
                
                {/* Bar Background with Gradient */}
                <div className="absolute inset-0 rounded-t-xl bg-gradient-to-t from-emerald-600 via-emerald-500 to-cyan-400" />
                
                {/* Inner Light Effect */}
                <div className="absolute inset-0 rounded-t-xl bg-gradient-to-b from-white/30 via-transparent to-transparent" style={{ height: '40%' }} />
                
                {/* Animated Scanline */}
                <motion.div
                  className="absolute inset-x-0 h-8 bg-gradient-to-b from-white/40 to-transparent"
                  animate={{ y: ['0%', '400%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: i * 0.15 }}
                />
                
                {/* Side Glow Lines */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-300/80 via-emerald-400/50 to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-300/80 via-emerald-400/50 to-transparent" />
                
                {/* Top Cap Glow */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-cyan-400/60 rounded-full blur-sm" />
                
                {/* Floating Value */}
                <motion.div 
                  className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#0a0a0c]/95 border border-emerald-500/40 rounded-lg text-xs text-emerald-400 font-mono opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg shadow-emerald-500/20"
                  initial={{ y: 5 }}
                  whileHover={{ y: 0 }}
                >
                  <span className="text-white font-bold">{item.commits}</span> commits
                </motion.div>
              </motion.div>
              <span className="text-xs text-white/50 font-medium tracking-wide">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Sleek Radial Ring Chart - Modern Stacked Rings Design
function FuturisticDonutChart({ data, size = 160 }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const [activeIndex, setActiveIndex] = useState(null);
  
  const radius = 42;
  const strokeWidth = 6;
  const gap = 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Subtle background glow */}
      <div 
        className="absolute inset-4 rounded-full opacity-30 blur-xl"
        style={{
          background: `radial-gradient(circle, ${data[0]?.color}40 0%, transparent 70%)`
        }}
      />
      
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          {data.map((item, i) => (
            <linearGradient key={`ringGrad-${i}`} id={`ringGrad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={item.color} stopOpacity="1" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0.6" />
            </linearGradient>
          ))}
          <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="glow"/>
            <feMerge>
              <feMergeNode in="glow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background track rings */}
        {data.map((_, i) => {
          const ringRadius = radius - i * (strokeWidth + gap);
          return (
            <circle
              key={`bg-${i}`}
              cx="50" cy="50"
              r={ringRadius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        })}
        
        {/* Animated data rings */}
        {data.map((item, i) => {
          const ringRadius = radius - i * (strokeWidth + gap);
          const ringCircumference = 2 * Math.PI * ringRadius;
          const progress = item.value / 100;
          const dashLength = ringCircumference * progress;
          const isActive = activeIndex === i;
          
          return (
            <g key={i}>
              {/* Glow layer for active state */}
              {isActive && (
                <motion.circle
                  cx="50" cy="50"
                  r={ringRadius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={strokeWidth + 4}
                  strokeLinecap="round"
                  strokeDasharray={`${dashLength} ${ringCircumference}`}
                  strokeDashoffset={ringCircumference * 0.25}
                  opacity={0.3}
                  filter="url(#ringGlow)"
                />
              )}
              
              {/* Main ring */}
              <motion.circle
                cx="50" cy="50"
                r={ringRadius}
                fill="none"
                stroke={`url(#ringGrad-${i})`}
                strokeWidth={isActive ? strokeWidth + 1 : strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${dashLength} ${ringCircumference}`}
                initial={{ strokeDashoffset: ringCircumference * 1.25 }}
                animate={{ strokeDashoffset: ringCircumference * 0.25 }}
                transition={{ 
                  duration: 1.2, 
                  delay: i * 0.15, 
                  ease: [0.4, 0, 0.2, 1]
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                className="cursor-pointer transition-all duration-200"
                style={{ filter: isActive ? 'brightness(1.2)' : 'none' }}
              />
              
              {/* End dot indicator */}
              <motion.circle
                cx={50 + ringRadius * Math.cos((progress * 360 - 90) * Math.PI / 180)}
                cy={50 + ringRadius * Math.sin((progress * 360 - 90) * Math.PI / 180)}
                r={isActive ? 3 : 2}
                fill={item.color}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 1 + i * 0.15 }}
              >
                {isActive && (
                  <animate
                    attributeName="opacity"
                    values="1;0.5;1"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                )}
              </motion.circle>
            </g>
          );
        })}
        
        {/* Center content */}
        <circle cx="50" cy="50" r="18" fill="#0a0a0c" />
        <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      </svg>
      
      {/* Center stats */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {activeIndex !== null ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col items-center"
              >
                <span 
                  className="text-lg font-bold"
                  style={{ color: data[activeIndex]?.color }}
                >
                  {data[activeIndex]?.value}%
                </span>
                <span className="text-[8px] text-white/50 uppercase tracking-wider">
                  {data[activeIndex]?.name?.slice(0, 6)}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="total"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col items-center"
              >
                <span className="text-lg font-bold text-white">{total}%</span>
                <span className="text-[8px] text-white/40 uppercase tracking-wider">Total</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Legend on side */}
      <div className="absolute -right-24 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {data.map((item, i) => (
          <motion.div
            key={i}
            className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-200 cursor-pointer ${
              activeIndex === i ? 'bg-white/5' : ''
            }`}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: item.color,
                boxShadow: activeIndex === i ? `0 0 8px ${item.color}` : 'none'
              }}
            />
            <span className="text-[10px] text-white/60">{item.name}</span>
            <span 
              className="text-[10px] font-medium ml-auto"
              style={{ color: activeIndex === i ? item.color : 'rgba(255,255,255,0.4)' }}
            >
              {item.value}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Cyberpunk Line Chart with Glowing Effects
function FuturisticLineChart({ data, height = 120 }) {
  const maxValue = Math.max(...data.map(d => d.lines));
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (d.lines / maxValue) * 75 - 10,
    value: d.lines,
    name: d.name
  }));
  
  // Create smooth curve path
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + point.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="neonLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="30%" stopColor="#06b6d4" />
            <stop offset="70%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="neonAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur1"/>
            <feGaussianBlur stdDeviation="4" result="blur2"/>
            <feMerge>
              <feMergeNode in="blur2"/>
              <feMergeNode in="blur1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="pointGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Animated Background Grid */}
        {[20, 40, 60, 80].map((y, i) => (
          <motion.line 
            key={y} 
            x1="0" y1={y} x2="100" y2={y} 
            stroke="rgba(16,185,129,0.1)" 
            strokeWidth="0.3"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
        
        {/* Area Fill with Gradient */}
        <motion.path
          d={`${pathD} L 100 95 L 0 95 Z`}
          fill="url(#neonAreaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        
        {/* Main Glowing Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#neonLineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#neonGlow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
        
        {/* Secondary Thin Line for Definition */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          strokeOpacity="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
        
        {/* Data Points with Pulsing Effect */}
        {points.map((p, i) => (
          <g key={i} className="cursor-pointer">
            {/* Outer Pulse Ring */}
            <motion.circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="0.5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
            />
            {/* Main Point */}
            <motion.circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#0a0a0c"
              stroke="url(#neonLineGrad)"
              strokeWidth="2"
              filter="url(#pointGlow)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 * i + 2 }}
              whileHover={{ scale: 1.5 }}
            />
            {/* Inner Glow */}
            <motion.circle
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill="#10b981"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            />
          </g>
        ))}
      </svg>
      
      {/* X-Axis Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
        {points.map((p, i) => (
          <span key={i} className="text-[10px] text-white/30 font-mono">{p.name}</span>
        ))}
      </div>
    </div>
  );
}

// Radial Progress Chart
function RadialProgress({ value, max, label, color = "#10b981", size = 100 }) {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{value}</span>
        <span className="text-xs text-white/40">{label}</span>
      </div>
    </div>
  );
}

// ==================== OTHER COMPONENTS ====================

function AnimatedCounter({ value, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count.toLocaleString()}</span>;
}

function StatsCard({ icon, label, value, change, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative p-5 bg-[#0c0c0f] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all cursor-pointer"
    >
      <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${color}`} />
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {change && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${change > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1"><AnimatedCounter value={value} /></p>
      <p className="text-sm text-white/40">{label}</p>
      <motion.div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

function WorkspaceCard({ workspace, delay, onOpen, onDelete, onToggleStar, formatDate }) {
  const langIcons = { javascript: "🟨", typescript: "🔷", python: "🐍", html: "🌐", css: "🎨", java: "☕" };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onOpen}
      className="group relative p-4 bg-[#0c0c0f] border border-white/5 rounded-xl hover:border-white/10 transition-all cursor-pointer"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: workspace.color }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: `${workspace.color}15` }}>
          {langIcons[workspace.language] || "📁"}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleStar(); }} className={`p-1.5 rounded-lg transition-all ${workspace.starred ? 'text-amber-400' : 'text-white/20 hover:text-white/40'}`}>
          <svg className="w-4 h-4" fill={workspace.starred ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>
      <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1 truncate">{workspace.name}</h3>
      {workspace.description && <p className="text-xs text-white/40 mb-3 truncate">{workspace.description}</p>}
      <div className="flex items-center justify-between text-xs text-white/40">
        <span className={`px-1.5 py-0.5 rounded ${workspace.type === "realtime" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>
          {workspace.type === "realtime" ? "⚡ Live" : "📝 Solo"}
        </span>
        <span>{formatDate(workspace.lastOpened)}</span>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute bottom-3 right-3 p-1.5 rounded-lg text-transparent group-hover:text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </motion.div>
  );
}

// ==================== MAIN DASHBOARD ====================

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [error, setError] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  // Handler for quick actions
  const handleQuickAction = (action) => {
    if (action === "Join Session") {
      setShowJoinModal(true);
    }
    // Add more actions as needed
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading) return;
      
      if (!isAuthenticated) {
        navigate("/auth");
        return;
      }
      
      try {
        // Fetch all dashboard data in parallel
        const [workspacesRes, statsRes, activityRes, languagesRes, activitiesRes] = await Promise.all([
          workspaceAPI.getAll(),
          dashboardAPI.getStats(),
          dashboardAPI.getWeeklyActivity(),
          dashboardAPI.getLanguages(),
          dashboardAPI.getActivities()
        ]);
        
        setWorkspaces(workspacesRes.workspaces || []);
        setDashboardStats(statsRes.stats || null);
        setWeeklyActivity(activityRes.activityData || activityData);
        setLanguages(languagesRes.languageData || languageData);
        setActivities(activitiesRes.activities || recentActivity);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Using demo data.");
        // Fallback to initial mock data
        setWorkspaces(initialWorkspaces);
        setWeeklyActivity(activityData);
        setLanguages(languageData);
        setActivities(recentActivity);
      } finally {
        // Add a small delay for smooth loading animation
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    
    fetchDashboardData();
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  
  const handleOpenWorkspace = async (workspace) => {
    try {
      await workspaceAPI.update(workspace._id || workspace.id, { lastOpened: new Date().toISOString() });
      const updated = workspaces.map(ws => (ws._id || ws.id) === (workspace._id || workspace.id) ? { ...ws, lastOpened: new Date().toISOString() } : ws);
      setWorkspaces(updated);
    } catch (err) {
      console.error("Failed to update workspace:", err);
    }
    const wsId = workspace._id || workspace.id;
    const wsType = workspace.workspaceType || workspace.type || "realtime";
    navigate(wsType === "realtime" ? `/editor/${wsId}` : `/editor-plain/${wsId}`);
  };
  
  const handleDeleteClick = (workspace) => { setWorkspaceToDelete(workspace); setShowDeleteModal(true); };
  
  const handleConfirmDelete = async () => {
    if (workspaceToDelete) {
      try {
        const wsId = workspaceToDelete._id || workspaceToDelete.id;
        await workspaceAPI.delete(wsId);
        const updated = workspaces.filter(ws => (ws._id || ws.id) !== wsId);
        setWorkspaces(updated);
      } catch (err) {
        console.error("Failed to delete workspace:", err);
        setError("Failed to delete workspace");
      }
    }
    setShowDeleteModal(false);
    setWorkspaceToDelete(null);
  };
  
  const toggleStar = async (workspaceId) => {
    try {
      await workspaceAPI.toggleStar(workspaceId);
      const updated = workspaces.map(ws => (ws._id || ws.id) === workspaceId ? { ...ws, starred: !ws.starred } : ws);
      setWorkspaces(updated);
    } catch (err) {
      console.error("Failed to toggle star:", err);
    }
  };
  
  const formatDate = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getSidebarIcon = (icon) => {
    const icons = {
      home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
      folder: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />,
      template: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />,
      clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
      star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
      credit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
      settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
      help: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    };
    return icons[icon];
  };

  if (isLoading) return <LoadingScreen />;
  if (!user) return null;

  const stats = [
    { icon: "📁", label: "Workspaces", value: workspaces.length, change: 12, color: "from-emerald-500 to-cyan-500" },
    { icon: "⚡", label: "Live Sessions", value: workspaces.filter(w => w.type === "realtime").length, change: 8, color: "from-cyan-500 to-blue-500" },
    { icon: "📝", label: "Lines of Code", value: 12847, change: 24, color: "from-violet-500 to-purple-500" },
    { icon: "👥", label: "Collaborators", value: 23, change: -3, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="h-screen w-full flex bg-[#060608] overflow-hidden">
      {/* Sidebar */}
      <motion.aside initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`${sidebarCollapsed ? 'w-16' : 'w-64'} shrink-0 bg-[#0a0a0c] border-r border-white/5 flex flex-col transition-all duration-300`}>
                {/* Quick Actions Row */}
                <div className="px-3 pb-2">
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium shadow hover:shadow-lg transition-all cursor-pointer select-none`}
                        onClick={() => handleQuickAction(action.name)}
                      >
                        <span className="text-lg">{action.icon}</span>
                        {!sidebarCollapsed && <span className="text-sm">{action.name}</span>}
                      </button>
                    ))}
                  </div>
                </div>
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5 outline-none cursor-pointer select-none" draggable="false">
            <motion.img src={logo} alt="SyncIDE" className="w-8 h-8 pointer-events-none" animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} draggable="false" />
            {!sidebarCollapsed && <span className="text-lg font-bold text-white select-none pointer-events-none">SyncIDE</span>}
          </Link>
          {!sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors outline-none cursor-pointer select-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            </button>
          )}
        </div>
        <div className="p-3">
          <motion.button onClick={() => setShowCreateModal(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer select-none" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            {!sidebarCollapsed && <span>New Workspace</span>}
          </motion.button>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer select-none outline-none ${activeSection === item.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{getSidebarIcon(item.icon)}</svg>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-white/5 space-y-1">
          {bottomSidebarItems.map((item) => (
            <Link key={item.id} to={item.path || "#"} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer select-none outline-none">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{getSidebarIcon(item.icon)}</svg>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-white/5">
            <Link to="/account" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer select-none outline-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">{user.name?.charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
            </Link>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#060608]">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white capitalize">{activeSection}</h1>
            <span className="text-xs text-white/30">•</span>
            <span className="text-sm text-white/50">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-12 w-80 bg-[#0c0c0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-white/5"><h3 className="font-semibold text-white">Notifications</h3></div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer ${notif.unread ? 'bg-emerald-500/5' : ''}`}>
                          <div className="flex gap-3">
                            {notif.unread && <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0" />}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{notif.title}</p>
                              <p className="text-xs text-white/50 mt-0.5">{notif.desc}</p>
                              <p className="text-xs text-white/30 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/account" className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</div>
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors cursor-pointer" title="Sign Out">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-[#060608]">
          {/* Join Room Modal */}
          <JoinRoomModal open={showJoinModal} onClose={() => setShowJoinModal(false)} />
          <AnimatePresence mode="wait">
            {/* Overview Section */}
            {activeSection === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Welcome Banner */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative p-5 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-violet-500/10 border border-emerald-500/20 rounded-2xl overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-xl font-bold text-white mb-1">Welcome back, {user.name?.split(' ')[0]}! 👋</h2>
                    <p className="text-white/60 text-sm">{workspaces.length} workspaces • {notifications.filter(n => n.unread).length} notifications</p>
                  </div>
                </motion.div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {stats.map((stat, i) => <StatsCard key={i} {...stat} delay={i * 0.1} />)}
                </div>

                {/* Tasks & Team */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Upcoming Tasks */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 p-4 bg-[#0c0c0f] border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white text-sm">Upcoming Tasks</h3>
                      <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full">{upcomingTasks.length} pending</span>
                    </div>
                    <div className="space-y-2">
                      {upcomingTasks.slice(0, 3).map((task, i) => (
                        <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                          <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white group-hover:text-emerald-400 transition-colors truncate">{task.title}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${task.due === 'Today' ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/40'}`}>{task.due}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Team Members */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-4 bg-[#0c0c0f] border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white text-sm">Team</h3>
                      <span className="text-xs text-emerald-400">{teamMembers.filter(m => m.status === 'online').length} online</span>
                    </div>
                    <div className="space-y-2">
                      {teamMembers.slice(0, 4).map((member, i) => (
                        <motion.div key={member.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                          <div className="relative">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">{member.avatar}</div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0c0c0f] ${member.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                          </div>
                          <span className="text-sm text-white/70 truncate flex-1">{member.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Weekly Activity */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 p-4 bg-[#0c0c0f] border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white text-sm">Weekly Activity</h3>
                      <span className="text-xs text-emerald-400">+18%</span>
                    </div>
                    <FuturisticBarChart data={activityData} height={140} />
                  </motion.div>

                  {/* Languages */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-4 bg-[#0c0c0f] border border-white/5 rounded-xl">
                    <h3 className="font-semibold text-white text-sm mb-3">Languages</h3>
                    <div className="flex justify-center">
                      <FuturisticDonutChart data={languageData} size={120} />
                    </div>
                  </motion.div>
                </div>

                {/* Recent Workspaces */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white text-sm">Recent Workspaces</h3>
                    <button onClick={() => setActiveSection("workspaces")} className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer">View all →</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {workspaces.slice(0, 4).map((workspace, i) => <WorkspaceCard key={workspace.id} workspace={workspace} delay={i * 0.05} onOpen={() => handleOpenWorkspace(workspace)} onDelete={() => handleDeleteClick(workspace)} onToggleStar={() => toggleStar(workspace.id)} formatDate={formatDate} />)}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Workspaces Section */}
            {activeSection === "workspaces" && (
              <motion.div key="workspaces" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6"><div><h2 className="text-xl font-bold text-white">All Workspaces</h2><p className="text-sm text-white/50">{workspaces.length} workspaces</p></div></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {workspaces.map((workspace, i) => <WorkspaceCard key={workspace.id} workspace={workspace} delay={i * 0.05} onOpen={() => handleOpenWorkspace(workspace)} onDelete={() => handleDeleteClick(workspace)} onToggleStar={() => toggleStar(workspace.id)} formatDate={formatDate} />)}
                </div>
              </motion.div>
            )}

            {/* Templates Section */}
            {activeSection === "templates" && (
              <motion.div key="templates" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Project Templates</h2>
                    <p className="text-sm text-white/50">Start your next project with a pre-configured template</p>
                  </div>
                  <div className="flex gap-2">
                    {["All", "Frontend", "Backend", "Fullstack"].map((cat) => (
                      <button key={cat} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${cat === "All" ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projectTemplates.map((template, i) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * i }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="group p-6 bg-[#0c0c0f] border border-white/5 rounded-2xl hover:border-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl" style={{ background: `${template.color}15` }}>
                          {template.icon}
                        </div>
                        <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-white/50">{template.category}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2">{template.name}</h3>
                      <p className="text-sm text-white/40 mb-4">Pre-configured {template.category.toLowerCase()} template with best practices and modern tooling.</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">⬇ {template.downloads} downloads</span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          Use Template
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Create Custom Template */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Create Custom Template</h3>
                      <p className="text-sm text-white/50">Save your current workspace as a reusable template</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-violet-500 text-white font-medium rounded-xl cursor-pointer"
                    >
                      Create Template
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Activity Section */}
            {activeSection === "activity" && (
              <motion.div key="activity" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Activity Feed</h2>
                    <p className="text-sm text-white/50">Your recent coding activity and collaborations</p>
                  </div>
                  <div className="flex gap-2">
                    {["All", "Commits", "Collabs", "Deploys"].map((filter) => (
                      <button key={filter} className={`px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${filter === "All" ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/50 hover:text-white'}`}>
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Activity Timeline */}
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-cyan-500 to-violet-500" />
                  <div className="space-y-4">
                    {[
                      { id: 1, type: "commit", title: "Fixed authentication bug", desc: "Updated JWT token validation logic in auth middleware", workspace: "API Backend", time: "2 min ago", icon: "🔧", color: "emerald" },
                      { id: 2, type: "collab", title: "Sarah Chen joined your session", desc: "Started live collaboration on React Dashboard", workspace: "React Dashboard", time: "15 min ago", icon: "👥", color: "cyan" },
                      { id: 3, type: "deploy", title: "Production deployment successful", desc: "v2.4.1 deployed to production servers", workspace: "API Backend", time: "1 hour ago", icon: "🚀", color: "violet" },
                      { id: 4, type: "commit", title: "Added new chart components", desc: "Implemented FuturisticBarChart and DonutChart", workspace: "React Dashboard", time: "2 hours ago", icon: "📊", color: "emerald" },
                      { id: 5, type: "review", title: "Code review completed", desc: "Approved PR #42: Refactor database queries", workspace: "Python ML", time: "3 hours ago", icon: "✅", color: "cyan" },
                      { id: 6, type: "create", title: "New workspace created", desc: "Mobile App UI workspace initialized", workspace: "Mobile App UI", time: "5 hours ago", icon: "✨", color: "violet" },
                      { id: 7, type: "commit", title: "Optimized bundle size", desc: "Reduced production bundle by 40%", workspace: "React Dashboard", time: "Yesterday", icon: "📦", color: "emerald" },
                      { id: 8, type: "collab", title: "Mike invited to workspace", desc: "Mike Johnson now has access to API Backend", workspace: "API Backend", time: "Yesterday", icon: "📧", color: "cyan" },
                    ].map((activity, i) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="relative pl-14"
                      >
                        <div className={`absolute left-4 w-5 h-5 rounded-full flex items-center justify-center text-xs border-2 border-[#060608] ${
                          activity.color === 'emerald' ? 'bg-emerald-500' : activity.color === 'cyan' ? 'bg-cyan-500' : 'bg-violet-500'
                        }`}>
                          {activity.icon}
                        </div>
                        <div className="p-4 bg-[#0c0c0f] border border-white/5 rounded-xl hover:border-white/10 transition-colors cursor-pointer group">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors">{activity.title}</h4>
                            <span className="text-xs text-white/40">{activity.time}</span>
                          </div>
                          <p className="text-sm text-white/50 mb-2">{activity.desc}</p>
                          <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 bg-white/5 rounded-lg text-white/50">
                            📁 {activity.workspace}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Load More */}
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl transition-colors cursor-pointer"
                  >
                    Load More Activity
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Subscription Section */}
            {activeSection === "subscription" && (
              <motion.div key="subscription" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-3">Choose Your Plan</h2>
                  <p className="text-white/50 max-w-lg mx-auto">Unlock the full potential of SyncIDE with our premium features</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {subscriptionPlans.map((plan, i) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className={`relative p-6 rounded-2xl border transition-all cursor-pointer ${
                        plan.popular 
                          ? 'bg-gradient-to-b from-emerald-500/10 to-cyan-500/5 border-emerald-500/30 scale-105' 
                          : 'bg-[#0c0c0f] border-white/5 hover:border-white/10'
                      } ${currentPlan === plan.id ? 'ring-2 ring-emerald-500' : ''}`}
                      onClick={() => setCurrentPlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-xs font-semibold text-white">
                          Most Popular
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                        <p className="text-sm text-white/50 mb-4">{plan.description}</p>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-white">${plan.price}</span>
                          <span className="text-white/40">/{plan.period}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, j) => (
                          <div key={j} className="flex items-center gap-3 text-sm">
                            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-white/70">{feature}</span>
                          </div>
                        ))}
                        {plan.limitations.map((limitation, j) => (
                          <div key={j} className="flex items-center gap-3 text-sm">
                            <svg className="w-5 h-5 text-red-400/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-white/40">{limitation}</span>
                          </div>
                        ))}
                      </div>

                      <motion.button
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          currentPlan === plan.id
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : plan.popular
                              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                              : 'bg-white/5 text-white hover:bg-white/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {currentPlan === plan.id ? '✓ Current Plan' : plan.price === 0 ? 'Get Started' : 'Upgrade Now'}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                {/* Features Comparison */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 p-6 bg-[#0c0c0f] border border-white/5 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-6 text-center">Why Upgrade to Pro?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { icon: "⚡", title: "Real-time Collaboration", desc: "Code together with your team in real-time" },
                      { icon: "📊", title: "Advanced Analytics", desc: "Track your coding patterns and productivity" },
                      { icon: "🔒", title: "Enhanced Security", desc: "Enterprise-grade security for your code" },
                    ].map((feature, i) => (
                      <div key={i} className="text-center p-4">
                        <span className="text-3xl mb-3 block">{feature.icon}</span>
                        <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                        <p className="text-sm text-white/50">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Starred Section */}
            {activeSection === "starred" && (
              <motion.div key="starred" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-xl font-bold text-white mb-6">Starred Workspaces</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {workspaces.filter(w => w.starred).map((workspace, i) => <WorkspaceCard key={workspace.id} workspace={workspace} delay={i * 0.05} onOpen={() => handleOpenWorkspace(workspace)} onDelete={() => handleDeleteClick(workspace)} onToggleStar={() => toggleStar(workspace.id)} formatDate={formatDate} />)}
                </div>
                {workspaces.filter(w => w.starred).length === 0 && <div className="text-center py-12"><span className="text-4xl mb-4 block">⭐</span><p className="text-white/50">No starred workspaces</p></div>}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && <CreateWorkspaceModal onClose={() => setShowCreateModal(false)} onCreateWorkspace={async (wsData) => { 
          try {
            const res = await workspaceAPI.create(wsData);
            const newWs = res.workspace;
            setWorkspaces([newWs, ...workspaces]); 
            setShowCreateModal(false); 
            handleOpenWorkspace(newWs); 
          } catch (err) {
            console.error("Failed to create workspace:", err);
            setError("Failed to create workspace");
          }
        }} />}
      </AnimatePresence>
      <AnimatePresence>
        {showDeleteModal && workspaceToDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => { setShowDeleteModal(false); setWorkspaceToDelete(null); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#0c0c0f] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-5">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4"><svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div>
                <h3 className="text-lg font-semibold text-white mb-2">Delete Workspace</h3>
                <p className="text-sm text-white/60 mb-4">Delete <span className="font-medium text-white">"{workspaceToDelete.name}"</span>?</p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowDeleteModal(false); setWorkspaceToDelete(null); }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">Cancel</button>
                  <button onClick={handleConfirmDelete} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer">Delete</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}
    </div>
  );
}

function CreateWorkspaceModal({ onClose, onCreateWorkspace }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("realtime");
  const [language, setLanguage] = useState("javascript");
  const languages = [{ id: "javascript", name: "JavaScript", icon: "🟨" }, { id: "typescript", name: "TypeScript", icon: "🔷" }, { id: "python", name: "Python", icon: "🐍" }, { id: "html", name: "HTML", icon: "🌐" }, { id: "java", name: "Java", icon: "☕" }, { id: "go", name: "Go", icon: "🔵" }];
  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];
  const handleCreate = () => { if (!name.trim()) return; onCreateWorkspace({ id: `ws_${Date.now()}`, name: name.trim(), type, language, createdAt: new Date().toISOString(), lastOpened: new Date().toISOString(), collaborators: 1, files: 1, color: colors[Math.floor(Math.random() * colors.length)], starred: false, description: null }); };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0c0c0f] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
        <div className="p-5 border-b border-white/5"><h2 className="text-lg font-semibold text-white">Create Workspace</h2></div>
        <div className="p-5 space-y-4">
          <div><label className="block text-sm font-medium text-white/70 mb-2">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Project" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" autoFocus /></div>
          <div><label className="block text-sm font-medium text-white/70 mb-2">Type</label><div className="grid grid-cols-2 gap-3"><button onClick={() => setType("realtime")} className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${type === "realtime" ? "border-emerald-500 bg-emerald-500/10" : "border-white/10 hover:border-white/20"}`}><span className="text-lg mb-1 block">⚡</span><span className="text-sm font-medium text-white">Real-time</span></button><button onClick={() => setType("plain")} className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${type === "plain" ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/20"}`}><span className="text-lg mb-1 block">📝</span><span className="text-sm font-medium text-white">Plain</span></button></div></div>
          <div><label className="block text-sm font-medium text-white/70 mb-2">Language</label><div className="grid grid-cols-3 gap-2">{languages.map((lang) => (<button key={lang.id} onClick={() => setLanguage(lang.id)} className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${language === lang.id ? "border-emerald-500 bg-emerald-500/10" : "border-white/10 hover:border-white/20"}`}><span className="text-lg">{lang.icon}</span><p className="text-xs text-white/60 mt-1">{lang.name}</p></button>))}</div></div>
        </div>
        <div className="p-5 border-t border-white/5 flex gap-3"><button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">Cancel</button><button onClick={handleCreate} disabled={!name.trim()} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 text-white disabled:opacity-50 transition-all cursor-pointer">Create</button></div>
      </motion.div>
    </>
  );
}
