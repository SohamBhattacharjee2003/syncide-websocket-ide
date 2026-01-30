const steps = [
  "Create Workspace",
  "Invite Collaborators",
  "Edit Code Together",
  "Persist & Scale",
];

export default function WorkflowSection() {
  return (
    <section className="py-40 px-6 bg-neutral-900/40">
      <h2 className="text-3xl font-semibold text-center mb-20">
        Building Towards Change
      </h2>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-neutral-950 border border-emerald-400 flex items-center justify-center text-emerald-400 font-bold">
              {i + 1}
            </div>
            <p className="mt-4 text-sm text-neutral-400">{step}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <p className="text-4xl font-bold text-emerald-400">100%</p>
        <p className="text-sm text-neutral-400 mt-2">
          Real-time synchronization accuracy
        </p>
      </div>
    </section>
  );
}
