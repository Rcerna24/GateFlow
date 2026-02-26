const highlights = [
  {
    label: 'Gate orchestration',
    value: '2.4M events / hr',
  },
  {
    label: 'Latency budget',
    value: '96 ms p95',
  },
  {
    label: 'Zero-trust policies',
    value: '54 regions',
  },
]

const capabilities = [
  {
    title: 'Visual builder',
    description: 'Compose gate flows with drag-and-drop steps, live data probes, and semantic validation.',
  },
  {
    title: 'Policy intelligence',
    description: 'Blend deterministic rules with behavioral models to keep fraud signals ahead of attackers.',
  },
  {
    title: 'Insight console',
    description: 'Audit every hop with replayable timelines, anomaly diffs, and actionable alerts.',
  },
]

function App() {
  return (
    <div className="bg-aurora">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-20 lg:px-12">
        <header className="flex flex-col gap-10 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 self-center rounded-full border border-slate-700 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-300 lg:self-start">
            GateFlow
          </span>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Build high-trust decision gates without slowing teams down.
            </h1>
            <p className="text-base text-slate-300 sm:text-lg lg:max-w-3xl">
              Design, simulate, and promote access policies from a single canvas. GateFlow merges rapid
              experimentation with guardrails so every release ships with measurable resilience.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <button className="w-full rounded-full bg-gradient-to-r from-gate-primary to-gate-glow px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-card transition hover:opacity-90 sm:w-auto">
              Launch Studio
            </button>
            <button className="w-full rounded-full border border-slate-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-white sm:w-auto">
              Watch a demo
            </button>
          </div>
        </header>

        <section className="glass-panel grid gap-6 rounded-4xl p-6 shadow-card sm:grid-cols-3">
          {highlights.map((highlight) => (
            <div key={highlight.label} className="space-y-2 text-center sm:text-left">
              <p className="text-xs uppercase tracking-widest text-slate-400">{highlight.label}</p>
              <p className="text-2xl font-semibold text-white">{highlight.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {capabilities.map((capability) => (
            <article key={capability.title} className="glass-panel flex flex-col gap-4 rounded-3xl p-6 shadow-card">
              <h2 className="text-xl font-semibold text-white">{capability.title}</h2>
              <p className="text-sm leading-relaxed text-slate-300">{capability.description}</p>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gate-primary">
                Explore
              </span>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default App
