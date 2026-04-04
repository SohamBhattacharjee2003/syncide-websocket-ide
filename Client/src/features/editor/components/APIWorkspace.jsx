import { useState, useRef, useEffect } from "react";

// API Tester Workspace — fully functional HTTP request sender
export default function APIWorkspace() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [bodyText, setBodyText] = useState('{\n  "title": "Test",\n  "body": "Hello",\n  "userId": 1\n}');
  const [headersText, setHeadersText] = useState('{\n  "Content-Type": "application/json"\n}');
  const [activeReqTab, setActiveReqTab] = useState("Body");
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const sendRequest = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      let parsedHeaders = {};
      try { parsedHeaders = JSON.parse(headersText); } catch (_) {}

      const options = {
        method,
        headers: parsedHeaders,
      };

      if (["POST", "PUT", "PATCH"].includes(method) && bodyText.trim()) {
        options.body = bodyText;
      }

      const resp = await fetch(url, options);
      const duration = Date.now() - startTime;
      let responseBody = "";
      let contentType = resp.headers.get("content-type") || "";
      try {
        if (contentType.includes("json")) {
          const json = await resp.json();
          responseBody = JSON.stringify(json, null, 2);
        } else {
          responseBody = await resp.text();
        }
      } catch (_) {
        responseBody = "(Could not parse response body)";
      }

      const result = {
        status: resp.status,
        statusText: resp.statusText,
        duration,
        size: new Blob([responseBody]).size,
        body: responseBody,
        ok: resp.ok,
      };
      setResponse(result);
      setRequestHistory(prev => [{ method, url, status: resp.status, duration }, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(err.message.includes("Failed to fetch")
        ? "Network error — check CORS or the URL. Try using a public API."
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const methodColors = {
    GET: "text-emerald-400",
    POST: "text-yellow-400",
    PUT: "text-blue-400",
    DELETE: "text-red-400",
    PATCH: "text-orange-400",
  };

  return (
    <div className="h-full bg-[#0d0d0f] flex flex-col">
      {/* Header */}
      <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <span className="text-white font-medium">API Tester</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors"
          >
            History ({requestHistory.length})
          </button>
        </div>
      </div>

      {/* URL Bar */}
      <div className="p-3 border-b border-[#2a2a32] bg-[#0f0f12] shrink-0">
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={`bg-[#1e1e24] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm font-bold focus:outline-none ${methodColors[method] || "text-white"}`}
          >
            {["GET", "POST", "PUT", "DELETE", "PATCH"].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendRequest()}
            placeholder="https://api.example.com/endpoint"
            className="flex-1 bg-[#1e1e24] border border-[#2a2a32] rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 font-mono"
          />
          <button
            onClick={sendRequest}
            disabled={isLoading || !url.trim()}
            className="px-5 py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-lg transition-colors font-semibold text-sm flex items-center gap-2"
          >
            {isLoading ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
            ) : "Send"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Request Panel */}
        <div className="flex-1 border-r border-[#2a2a32] flex flex-col min-h-0">
          {/* Tabs */}
          <div className="flex border-b border-[#2a2a32] shrink-0">
            {["Body", "Headers"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveReqTab(tab)}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeReqTab === tab
                    ? "border-pink-500 text-pink-400"
                    : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 p-3 overflow-auto">
            <textarea
              value={activeReqTab === "Body" ? bodyText : headersText}
              onChange={(e) => activeReqTab === "Body" ? setBodyText(e.target.value) : setHeadersText(e.target.value)}
              placeholder={activeReqTab === "Body" ? '{"key": "value"}' : '{"Authorization": "Bearer token"}'}
              className="w-full h-full min-h-[120px] bg-[#111114] border border-[#2a2a32] rounded-lg p-4 text-xs text-gray-300 resize-none focus:outline-none font-mono leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Response Panel */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-3 border-b border-[#2a2a32] flex items-center justify-between shrink-0">
            <span className="text-white font-medium text-sm">Response</span>
            {response && (
              <div className="flex items-center gap-4 text-xs">
                <span className={response.ok ? "text-emerald-400" : "text-red-400"}>
                  {response.status} {response.statusText}
                </span>
                <span className="text-gray-500">{response.duration}ms</span>
                <span className="text-gray-500">{(response.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </div>
          <div className="flex-1 p-3 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Sending request...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm font-medium mb-1">Request failed</p>
                <p className="text-red-400/70 text-xs font-mono">{error}</p>
              </div>
            ) : response ? (
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
                {response.body}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm italic">
                Response will appear here after you send a request.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History overlay */}
      {showHistory && requestHistory.length > 0 && (
        <div className="absolute bottom-0 right-0 w-80 bg-[#111114] border border-[#2a2a32] rounded-t-xl shadow-2xl z-10 max-h-64 overflow-y-auto">
          <div className="p-3 border-b border-[#2a2a32] flex justify-between items-center">
            <span className="text-white text-sm font-medium">Request History</span>
            <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
          </div>
          {requestHistory.map((h, i) => (
            <button
              key={i}
              onClick={() => { setMethod(h.method); setUrl(h.url); setShowHistory(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left"
            >
              <span className={`text-xs font-bold ${methodColors[h.method] || "text-white"}`}>{h.method}</span>
              <span className="text-xs text-gray-400 flex-1 truncate font-mono">{h.url}</span>
              <span className={`text-xs ${h.status < 300 ? "text-emerald-400" : "text-red-400"}`}>{h.status}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
