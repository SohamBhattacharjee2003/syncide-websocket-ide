import { useState, useEffect } from "react";

// Figma Workspace — embed real Figma via URL or display a functional design canvas
export default function FigmaWorkspace({ workspaceId }) {
  const storageKey = `syncide_figma_${workspaceId || "global"}`;
  const [figmaUrl, setFigmaUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [mode, setMode] = useState("embed"); // "embed" | "canvas"
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Load saved Figma URL
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setFigmaUrl(saved);
      setEmbedUrl(toEmbedUrl(saved));
    }
  }, [storageKey]);

  function toEmbedUrl(url) {
    if (!url) return "";
    // Convert Figma share URL to embed URL
    if (url.includes("figma.com/file/") || url.includes("figma.com/proto/") || url.includes("figma.com/design/")) {
      const encoded = encodeURIComponent(url);
      return `https://www.figma.com/embed?embed_host=syncide&url=${encoded}`;
    }
    if (url.includes("figma.com/embed")) return url;
    return url; // treat as direct embed URL
  }

  const handleLoadUrl = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    const embed = toEmbedUrl(trimmed);
    setFigmaUrl(trimmed);
    setEmbedUrl(embed);
    localStorage.setItem(storageKey, trimmed);
    setShowUrlInput(false);
  };

  return (
    <div className="h-full bg-[#1a1a1f] flex flex-col">
      {/* Toolbar */}
      <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <span className="text-lg">🎨</span>
          </div>
          <span className="text-white font-medium">Figma Design</span>
          {figmaUrl && (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Linked
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors"
          >
            {figmaUrl ? "Change URL" : "Link Figma File"}
          </button>
          {figmaUrl && (
            <a
              href={figmaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs bg-purple-600/80 hover:bg-purple-600 text-white rounded transition-colors"
            >
              Open in Figma ↗
            </a>
          )}
        </div>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <div className="p-3 border-b border-[#2a2a32] bg-[#0f0f12] flex gap-2 shrink-0">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLoadUrl()}
            placeholder="Paste Figma share URL (e.g. https://www.figma.com/file/...)"
            className="flex-1 bg-[#1e1e24] border border-[#2a2a32] rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 font-mono"
            autoFocus
          />
          <button
            onClick={handleLoadUrl}
            disabled={!inputUrl.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Load
          </button>
          <button
            onClick={() => setShowUrlInput(false)}
            className="px-3 py-2 text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Content */}
      {embedUrl ? (
        <iframe
          src={embedUrl}
          className="flex-1 w-full border-0"
          allowFullScreen
          title="Figma Design"
        />
      ) : (
        /* Placeholder when no URL yet */
        <div
          className="flex-1 flex items-center justify-center"
          style={{ background: "repeating-conic-gradient(#1e1e24 0% 25%, #111114 0% 50%) 50% / 20px 20px" }}
        >
          <div className="text-center max-w-md p-8 bg-[#111114]/90 rounded-2xl border border-[#2a2a32] backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center text-4xl">
              🎨
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Link Your Figma File</h3>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              Paste a Figma share URL to embed your design directly in the editor.
              Get the URL from Figma → Share → Copy Link.
            </p>
            <button
              onClick={() => setShowUrlInput(true)}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Link Figma File
            </button>
            <p className="text-gray-600 text-xs mt-4">
              Supports: Figma files, prototypes, and design mockups
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
