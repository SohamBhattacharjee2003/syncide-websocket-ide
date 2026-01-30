const features = [
  {
    title: "Live Editing Engine",
    desc: "Multiple developers edit the same codebase in real time.",
  },
  {
    title: "Room Isolation Layer",
    desc: "Each workspace remains private and fully isolated.",
  },
  {
    title: "Persistent State",
    desc: "Code is automatically saved and restored.",
  },
  {
    title: "Low Latency Sync",
    desc: "Optimized WebSocket communication pipeline.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-32 px-6">
      <h2 className="text-3xl font-semibold text-center mb-20">
        Built for Real Collaboration
      </h2>

      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-8 text-center hover:border-emerald-400 transition"
          >
            <h3 className="font-semibold mb-3">{f.title}</h3>
            <p className="text-sm text-neutral-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
