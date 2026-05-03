type Metric = { label: string; value: string };

export function MetricStrip({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-xl border border-line bg-panel/60 px-3 py-3 sm:px-4"
        >
          <p className="text-[10px] font-mono uppercase tracking-wide text-muted">{m.label}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">{m.value}</p>
        </div>
      ))}
    </div>
  );
}
