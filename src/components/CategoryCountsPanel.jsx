import { getCategoryCounts } from "@/lib/annotations";

export default async function CategoryCountsPanel() {
  const counts = await getCategoryCounts();
  const sorted = [...counts].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="fixed left-6 top-6 z-10 hidden max-h-[calc(100vh-3rem)] w-56 flex-col border border-neutral-400 bg-white xl:flex">
      <div className="shrink-0 border-b border-neutral-300 px-3 py-2">
        <h2 className="text-sm font-semibold text-neutral-900">
          Object counts <span className="font-mono text-xs text-neutral-500">({total})</span>
        </h2>
      </div>
      <ul className="min-h-0 overflow-y-auto">
        {sorted.map((c) => (
          <li
            key={c.name}
            className="flex items-center justify-between gap-2 border-b border-neutral-100 px-3 py-1 text-sm last:border-b-0"
          >
            <span className="truncate text-neutral-800">{c.name}</span>
            <span className="font-mono text-xs text-neutral-500">{c.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
