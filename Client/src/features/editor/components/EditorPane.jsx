import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { useRef, useEffect } from "react";

export default function EditorPane({ 
  code, 
  onCodeChange, 
  language = "javascript",
  onCursorChange,
  remoteCursors = []
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Custom theme
    monaco.editor.defineTheme("syncide-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6B7280", fontStyle: "italic" },
        { token: "keyword", foreground: "C084FC" },
        { token: "string", foreground: "34D399" },
        { token: "number", foreground: "FBBF24" },
        { token: "function", foreground: "60A5FA" },
        { token: "variable", foreground: "E5E7EB" },
        { token: "type", foreground: "22D3EE" },
      ],
      colors: {
        "editor.background": "#0a0a0a",
        "editor.foreground": "#E5E7EB",
        "editorLineNumber.foreground": "#4B5563",
        "editorLineNumber.activeForeground": "#10B981",
        "editor.selectionBackground": "#10B98130",
        "editor.lineHighlightBackground": "#ffffff08",
        "editorCursor.foreground": "#10B981",
        "editor.selectionHighlightBackground": "#10B98120",
        "editorIndentGuide.background": "#ffffff10",
        "editorIndentGuide.activeBackground": "#ffffff20",
        "editorBracketMatch.background": "#10B98130",
        "editorBracketMatch.border": "#10B981",
        "scrollbarSlider.background": "#ffffff15",
        "scrollbarSlider.hoverBackground": "#ffffff25",
        "scrollbarSlider.activeBackground": "#ffffff35",
      },
    });

    monaco.editor.setTheme("syncide-dark");

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Focus editor
    editor.focus();
  };

  // Handle remote cursors decorations
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const decorations = remoteCursors.map((cursor) => ({
      range: new monacoRef.current.Range(
        cursor.line,
        cursor.column,
        cursor.line,
        cursor.column + 1
      ),
      options: {
        className: `remote-cursor-${cursor.id}`,
        beforeContentClassName: `remote-cursor-line-${cursor.id}`,
        hoverMessage: { value: cursor.name },
      },
    }));

    editorRef.current.deltaDecorations([], decorations);
  }, [remoteCursors]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex-1 relative overflow-hidden"
    >
      {/* Gradient overlay at top */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
      
      {/* Editor */}
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={onCodeChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          fontLigatures: true,
          lineHeight: 1.6,
          padding: { top: 16, bottom: 16 },
          minimap: { 
            enabled: true,
            scale: 1,
            showSlider: "mouseover",
            renderCharacters: false,
            maxColumn: 80,
          },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            useShadows: false,
          },
          renderLineHighlight: "all",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          wordWrap: "on",
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          quickSuggestions: true,
          snippetSuggestions: "top",
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-neutral-500 text-sm">Loading Editor...</span>
            </motion.div>
          </div>
        }
      />

      {/* Line highlight glow effect */}
      <style>{`
        .monaco-editor .view-overlays .current-line {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.03);
        }
        
        .monaco-editor .cursors-layer .cursor {
          background: linear-gradient(to bottom, #10B981, #06B6D4) !important;
          width: 2px !important;
        }

        .monaco-editor .minimap {
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .monaco-editor .minimap:hover {
          opacity: 1;
        }
      `}</style>
    </motion.div>
  );
}
