const stacks = ["JavaScript", "React", "Node.js", "MongoDB", "Socket.IO"];

export default function EcosystemSection() {
  return (
    <section className="py-32 px-6">
      <h2 className="text-3xl font-semibold text-center mb-16">
        Explore the Ecosystem
      </h2>

      <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-6">
        {stacks.map((s) => (
          <div
            key={s}
            className="px-6 py-3 rounded-full bg-neutral-900 border border-neutral-800 text-sm text-neutral-300 hover:border-emerald-400 transition"
          >
            {s}
          </div>
        ))}
      </div>
    </section>
  );
}
