export function FeaturedWorks({
  items,
}: {
  items: { id: string; title: string; thumb: string }[];
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-panel/40 px-4 py-6 text-center text-sm text-muted">
        Add official contracts in the dashboard to show featured works (demo placeholders).
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((w) => (
        <li key={w.id} className="overflow-hidden rounded-xl border border-line">
          <div
            className="aspect-square w-full"
            style={{ background: w.thumb }}
            role="img"
            aria-label={w.title}
          />
          <p className="truncate px-2 py-2 text-center text-[11px] text-zinc-300">{w.title}</p>
        </li>
      ))}
    </ul>
  );
}
