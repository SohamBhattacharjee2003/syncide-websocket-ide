export default function Footer() {
  return (
    <footer className="relative bg-neutral-950 pt-32 pb-16 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6">

        {/* TOP */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400" />
              <span className="text-xl font-semibold">SyncIDE</span>
            </div>

            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              A real-time collaborative development environment built
              for teams that move fast and build together.
            </p>

            <div className="flex gap-4 mt-6">
              {["🐦", "💬", "💻"].map((icon, i) => (
                <div
                  key={i}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-700 hover:border-emerald-400 transition"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* LINKS */}
          <FooterColumn
            title="Learn"
            links={["Docs", "Features", "Guides", "Changelog"]}
          />
          <FooterColumn
            title="Build"
            links={["Workspaces", "Editor", "API", "Open Source"]}
          />
          <FooterColumn
            title="Community"
            links={["Discord", "GitHub", "Twitter", "Blog"]}
          />
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
          <p>© 2026 SyncIDE. All rights reserved.</p>
          <p>Built with ❤️ by Soham</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-4">{title}</h4>
      <ul className="space-y-3 text-sm text-neutral-400">
        {links.map((link, i) => (
          <li
            key={i}
            className="hover:text-emerald-400 cursor-pointer transition"
          >
            {link}
          </li>
        ))}
      </ul>
    </div>
  );
}
