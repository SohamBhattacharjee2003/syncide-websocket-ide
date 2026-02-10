import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  VscSettingsGear,
  VscArrowLeft,
  VscColorMode,
  VscCode,
  VscBell,
  VscSave,
  VscSymbolKeyword,
  VscTerminal,
  VscExtensions,
  VscSync,
  VscGlobe,
  VscFile,
  VscBracketError,
  VscLayout,
  VscEdit,
  VscChevronRight,
} from "react-icons/vsc";
import logoImg from "../../../assets/logo.png";

// Settings categories
const settingsCategories = [
  { id: "appearance", icon: VscColorMode, label: "Appearance" },
  { id: "editor", icon: VscCode, label: "Editor" },
  { id: "terminal", icon: VscTerminal, label: "Terminal" },
  { id: "files", icon: VscFile, label: "Files" },
  { id: "extensions", icon: VscExtensions, label: "Extensions" },
  { id: "sync", icon: VscSync, label: "Sync" },
  { id: "notifications", icon: VscBell, label: "Notifications" },
  { id: "keyboard", icon: VscSymbolKeyword, label: "Keyboard Shortcuts" },
];

// Toggle switch component
function ToggleSwitch({ checked, onChange }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-white/10"
      }`}
    >
      <motion.div
        animate={{ x: checked ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
      />
    </motion.button>
  );
}

// Setting item component
function SettingItem({ icon: Icon, label, description, children }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl border border-white/5 transition-colors">
      <div className="flex items-center gap-4">
        {Icon && <Icon className="w-5 h-5 text-neutral-400" />}
        <div>
          <p className="text-white font-medium">{label}</p>
          {description && <p className="text-sm text-neutral-500">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// Select component
function SettingSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-neutral-900">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// Appearance Section
function AppearanceSection({ settings, updateSetting }) {
  const themes = [
    { value: "dark", label: "Dark" },
    { value: "light", label: "Light" },
    { value: "system", label: "System" },
    { value: "high-contrast", label: "High Contrast" },
  ];

  const iconThemes = [
    { value: "material", label: "Material Icons" },
    { value: "vscode", label: "VS Code Icons" },
    { value: "minimal", label: "Minimal" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
        <VscColorMode className="text-emerald-400" />
        Appearance
      </h2>

      <div className="space-y-3">
        <SettingItem
          icon={VscColorMode}
          label="Color Theme"
          description="Select the color theme for the editor"
        >
          <SettingSelect
            value={settings.theme}
            onChange={(v) => updateSetting("theme", v)}
            options={themes}
          />
        </SettingItem>

        <SettingItem
          icon={VscFile}
          label="File Icon Theme"
          description="Choose file icon style"
        >
          <SettingSelect
            value={settings.iconTheme}
            onChange={(v) => updateSetting("iconTheme", v)}
            options={iconThemes}
          />
        </SettingItem>

        <SettingItem
          icon={VscLayout}
          label="Compact Mode"
          description="Use compact menu and sidebar layout"
        >
          <ToggleSwitch
            checked={settings.compactMode}
            onChange={() => updateSetting("compactMode", !settings.compactMode)}
          />
        </SettingItem>

        <SettingItem
          icon={VscEdit}
          label="Smooth Animations"
          description="Enable smooth animations throughout the UI"
        >
          <ToggleSwitch
            checked={settings.smoothAnimations}
            onChange={() => updateSetting("smoothAnimations", !settings.smoothAnimations)}
          />
        </SettingItem>
      </div>
    </motion.div>
  );
}

// Editor Section
function EditorSection({ settings, updateSetting }) {
  const fontSizes = [12, 13, 14, 15, 16, 18, 20].map((s) => ({ value: s.toString(), label: `${s}px` }));
  const tabSizes = [2, 4, 8].map((s) => ({ value: s.toString(), label: `${s} spaces` }));
  const fontFamilies = [
    { value: "JetBrains Mono", label: "JetBrains Mono" },
    { value: "Fira Code", label: "Fira Code" },
    { value: "Consolas", label: "Consolas" },
    { value: "Monaco", label: "Monaco" },
    { value: "Source Code Pro", label: "Source Code Pro" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
        <VscCode className="text-emerald-400" />
        Editor
      </h2>

      <div className="space-y-3">
        <SettingItem
          icon={VscCode}
          label="Font Size"
          description="Editor font size in pixels"
        >
          <SettingSelect
            value={settings.fontSize.toString()}
            onChange={(v) => updateSetting("fontSize", parseInt(v))}
            options={fontSizes}
          />
        </SettingItem>

        <SettingItem
          icon={VscSymbolKeyword}
          label="Font Family"
          description="Editor font family"
        >
          <SettingSelect
            value={settings.fontFamily}
            onChange={(v) => updateSetting("fontFamily", v)}
            options={fontFamilies}
          />
        </SettingItem>

        <SettingItem
          icon={VscLayout}
          label="Tab Size"
          description="Number of spaces per tab"
        >
          <SettingSelect
            value={settings.tabSize.toString()}
            onChange={(v) => updateSetting("tabSize", parseInt(v))}
            options={tabSizes}
          />
        </SettingItem>

        <SettingItem
          icon={VscBracketError}
          label="Font Ligatures"
          description="Enable font ligatures (e.g., => becomes →)"
        >
          <ToggleSwitch
            checked={settings.fontLigatures}
            onChange={() => updateSetting("fontLigatures", !settings.fontLigatures)}
          />
        </SettingItem>

        <SettingItem
          icon={VscCode}
          label="Word Wrap"
          description="Wrap long lines automatically"
        >
          <ToggleSwitch
            checked={settings.wordWrap}
            onChange={() => updateSetting("wordWrap", !settings.wordWrap)}
          />
        </SettingItem>

        <SettingItem
          icon={VscLayout}
          label="Minimap"
          description="Show minimap on the right side"
        >
          <ToggleSwitch
            checked={settings.minimap}
            onChange={() => updateSetting("minimap", !settings.minimap)}
          />
        </SettingItem>

        <SettingItem
          icon={VscCode}
          label="Line Numbers"
          description="Show line numbers in the gutter"
        >
          <ToggleSwitch
            checked={settings.lineNumbers}
            onChange={() => updateSetting("lineNumbers", !settings.lineNumbers)}
          />
        </SettingItem>
      </div>
    </motion.div>
  );
}

// Terminal Section
function TerminalSection({ settings, updateSetting }) {
  const shells = [
    { value: "zsh", label: "Zsh" },
    { value: "bash", label: "Bash" },
    { value: "powershell", label: "PowerShell" },
    { value: "fish", label: "Fish" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
        <VscTerminal className="text-emerald-400" />
        Terminal
      </h2>

      <div className="space-y-3">
        <SettingItem
          icon={VscTerminal}
          label="Default Shell"
          description="Terminal shell to use"
        >
          <SettingSelect
            value={settings.defaultShell}
            onChange={(v) => updateSetting("defaultShell", v)}
            options={shells}
          />
        </SettingItem>

        <SettingItem
          icon={VscCode}
          label="Terminal Font Size"
          description="Font size for the integrated terminal"
        >
          <SettingSelect
            value={settings.terminalFontSize.toString()}
            onChange={(v) => updateSetting("terminalFontSize", parseInt(v))}
            options={[12, 13, 14, 15, 16].map((s) => ({ value: s.toString(), label: `${s}px` }))}
          />
        </SettingItem>

        <SettingItem
          icon={VscLayout}
          label="Cursor Blinking"
          description="Enable cursor blinking in terminal"
        >
          <ToggleSwitch
            checked={settings.terminalCursorBlinking}
            onChange={() => updateSetting("terminalCursorBlinking", !settings.terminalCursorBlinking)}
          />
        </SettingItem>
      </div>
    </motion.div>
  );
}

// Files Section
function FilesSection({ settings, updateSetting }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
        <VscFile className="text-emerald-400" />
        Files
      </h2>

      <div className="space-y-3">
        <SettingItem
          icon={VscSave}
          label="Auto Save"
          description="Automatically save files when switching tabs"
        >
          <ToggleSwitch
            checked={settings.autoSave}
            onChange={() => updateSetting("autoSave", !settings.autoSave)}
          />
        </SettingItem>

        <SettingItem
          icon={VscFile}
          label="Format On Save"
          description="Automatically format files when saving"
        >
          <ToggleSwitch
            checked={settings.formatOnSave}
            onChange={() => updateSetting("formatOnSave", !settings.formatOnSave)}
          />
        </SettingItem>

        <SettingItem
          icon={VscBracketError}
          label="Trim Trailing Whitespace"
          description="Remove trailing whitespace on save"
        >
          <ToggleSwitch
            checked={settings.trimWhitespace}
            onChange={() => updateSetting("trimWhitespace", !settings.trimWhitespace)}
          />
        </SettingItem>

        <SettingItem
          icon={VscFile}
          label="Insert Final Newline"
          description="Add newline at end of files on save"
        >
          <ToggleSwitch
            checked={settings.insertFinalNewline}
            onChange={() => updateSetting("insertFinalNewline", !settings.insertFinalNewline)}
          />
        </SettingItem>
      </div>
    </motion.div>
  );
}

// Notifications Section
function NotificationsSection({ settings, updateSetting }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
        <VscBell className="text-emerald-400" />
        Notifications
      </h2>

      <div className="space-y-3">
        <SettingItem
          icon={VscBell}
          label="Push Notifications"
          description="Receive browser push notifications"
        >
          <ToggleSwitch
            checked={settings.pushNotifications}
            onChange={() => updateSetting("pushNotifications", !settings.pushNotifications)}
          />
        </SettingItem>

        <SettingItem
          icon={VscBell}
          label="Collaboration Alerts"
          description="Notify when someone joins your room"
        >
          <ToggleSwitch
            checked={settings.collaborationAlerts}
            onChange={() => updateSetting("collaborationAlerts", !settings.collaborationAlerts)}
          />
        </SettingItem>

        <SettingItem
          icon={VscSync}
          label="Sync Status Updates"
          description="Show sync status notifications"
        >
          <ToggleSwitch
            checked={settings.syncNotifications}
            onChange={() => updateSetting("syncNotifications", !settings.syncNotifications)}
          />
        </SettingItem>

        <SettingItem
          icon={VscBell}
          label="Sound Effects"
          description="Play sound for notifications"
        >
          <ToggleSwitch
            checked={settings.soundEffects}
            onChange={() => updateSetting("soundEffects", !settings.soundEffects)}
          />
        </SettingItem>
      </div>
    </motion.div>
  );
}

// Sync Section
function SyncSection({ settings, updateSetting }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
        <VscSync className="text-emerald-400" />
        Sync Settings
      </h2>

      <div className="space-y-3">
        <SettingItem
          icon={VscSync}
          label="Settings Sync"
          description="Sync settings across devices"
        >
          <ToggleSwitch
            checked={settings.settingsSync}
            onChange={() => updateSetting("settingsSync", !settings.settingsSync)}
          />
        </SettingItem>

        <SettingItem
          icon={VscExtensions}
          label="Sync Extensions"
          description="Sync installed extensions"
        >
          <ToggleSwitch
            checked={settings.syncExtensions}
            onChange={() => updateSetting("syncExtensions", !settings.syncExtensions)}
          />
        </SettingItem>

        <SettingItem
          icon={VscSymbolKeyword}
          label="Sync Keybindings"
          description="Sync keyboard shortcuts"
        >
          <ToggleSwitch
            checked={settings.syncKeybindings}
            onChange={() => updateSetting("syncKeybindings", !settings.syncKeybindings)}
          />
        </SettingItem>

        <SettingItem
          icon={VscCode}
          label="Sync Snippets"
          description="Sync code snippets"
        >
          <ToggleSwitch
            checked={settings.syncSnippets}
            onChange={() => updateSetting("syncSnippets", !settings.syncSnippets)}
          />
        </SettingItem>
      </div>
    </motion.div>
  );
}

// Extensions Section
function ExtensionsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
        <VscExtensions className="text-emerald-400" />
        Extensions
      </h2>

      <div className="p-6 bg-white/[0.02] rounded-xl border border-white/5 text-center">
        <VscExtensions className="w-12 h-12 mx-auto text-neutral-500 mb-4" />
        <p className="text-neutral-400 mb-2">No extensions installed</p>
        <p className="text-sm text-neutral-500">Extensions will appear here once installed</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
        >
          Browse Extensions
        </motion.button>
      </div>
    </motion.div>
  );
}

// Keyboard Shortcuts Section
function KeyboardSection() {
  const shortcuts = [
    { keys: "⌘ + S", action: "Save File" },
    { keys: "⌘ + P", action: "Quick Open" },
    { keys: "⌘ + Shift + P", action: "Command Palette" },
    { keys: "⌘ + /", action: "Toggle Comment" },
    { keys: "⌘ + B", action: "Toggle Sidebar" },
    { keys: "⌘ + `", action: "Toggle Terminal" },
    { keys: "⌘ + Shift + F", action: "Search in Files" },
    { keys: "⌘ + D", action: "Add Selection" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
        <VscSymbolKeyword className="text-emerald-400" />
        Keyboard Shortcuts
      </h2>

      <div className="space-y-2">
        {shortcuts.map((shortcut, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg border border-white/5 transition-colors"
          >
            <span className="text-neutral-300">{shortcut.action}</span>
            <kbd className="px-3 py-1.5 bg-black/30 rounded-lg text-sm font-mono text-emerald-400 border border-white/10">
              {shortcut.keys}
            </kbd>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 hover:text-white rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2"
      >
        <VscEdit className="w-4 h-4" />
        <span>Edit Keyboard Shortcuts</span>
      </motion.button>
    </motion.div>
  );
}

// Main Settings Page Component
export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("appearance");
  
  // Settings state
  const [settings, setSettings] = useState({
    // Appearance
    theme: "dark",
    iconTheme: "material",
    compactMode: false,
    smoothAnimations: true,
    // Editor
    fontSize: 14,
    fontFamily: "JetBrains Mono",
    tabSize: 2,
    fontLigatures: true,
    wordWrap: false,
    minimap: false,
    lineNumbers: true,
    // Terminal
    defaultShell: "zsh",
    terminalFontSize: 14,
    terminalCursorBlinking: true,
    // Files
    autoSave: true,
    formatOnSave: true,
    trimWhitespace: true,
    insertFinalNewline: true,
    // Notifications
    pushNotifications: true,
    collaborationAlerts: true,
    syncNotifications: true,
    soundEffects: false,
    // Sync
    settingsSync: true,
    syncExtensions: true,
    syncKeybindings: true,
    syncSnippets: true,
  });

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const renderSection = () => {
    switch (activeCategory) {
      case "appearance":
        return <AppearanceSection settings={settings} updateSetting={updateSetting} />;
      case "editor":
        return <EditorSection settings={settings} updateSetting={updateSetting} />;
      case "terminal":
        return <TerminalSection settings={settings} updateSetting={updateSetting} />;
      case "files":
        return <FilesSection settings={settings} updateSetting={updateSetting} />;
      case "notifications":
        return <NotificationsSection settings={settings} updateSetting={updateSetting} />;
      case "sync":
        return <SyncSection settings={settings} updateSetting={updateSetting} />;
      case "extensions":
        return <ExtensionsSection />;
      case "keyboard":
        return <KeyboardSection />;
      default:
        return <AppearanceSection settings={settings} updateSetting={updateSetting} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-neutral-200">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <VscArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-3">
              <motion.img
                src={logoImg}
                alt="SyncIDE"
                className="w-8 h-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-lg font-semibold text-white">
                Sync<span className="text-emerald-400">IDE</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">Settings</span>
            <VscSettingsGear className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 shrink-0"
          >
            <div className="sticky top-24 space-y-2">
              {settingsCategories.map((category, i) => {
                const isActive = activeCategory === category.id;
                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <category.icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : ""}`} />
                    <span className="font-medium flex-1">{category.label}</span>
                    {isActive && <VscChevronRight className="w-4 h-4" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.aside>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 min-w-0"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Reset to Defaults
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <VscSave className="w-4 h-4" />
                Save Settings
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
