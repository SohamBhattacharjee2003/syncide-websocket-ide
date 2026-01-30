export default function LiveSignal() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-neutral-900/80 to-neutral-950 border border-neutral-800 rounded-2xl p-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-semibold">
              Live Collaboration Signal
            </h3>
            <p className="text-sm text-neutral-400 mt-1">
              Real-time system metrics reflecting workspace activity
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Operational
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Metric label="Active Rooms" value="24+" />
          <Metric label="Collaborators Online" value="78" />
          <Metric label="Avg Sync Latency" value="< 45ms" />
          <Metric label="Persistence" value="Enabled" />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 text-center">
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-emerald-400">
        {value}
      </p>
    </div>
  );
}
