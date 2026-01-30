export default function SecuritySection() {
  return (
    <section className="py-32 px-6 bg-neutral-900/40">
      <h2 className="text-3xl font-semibold text-center mb-20">
        Secured & Built to Scale
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <Card
          title="Room-Level Isolation"
          desc="No cross-room data leakage."
        />
        <Card
          title="Server-Side Validation"
          desc="All events verified at backend."
        />
        <Card
          title="Future-Ready"
          desc="Designed for horizontal scaling."
        />
      </div>
    </section>
  );
}

function Card({ title, desc }) {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 text-center">
      <h3 className="font-semibold mb-3">{title}</h3>
      <p className="text-sm text-neutral-400">{desc}</p>
    </div>
  );
}
