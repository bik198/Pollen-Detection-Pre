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
      <div className="flex shrink-0 flex-col gap-2 border-t border-neutral-300 p-2">
        <a
          href="/api/export/coco"
          className="border border-neutral-400 bg-white px-3 py-1.5 text-center text-sm hover:bg-neutral-100"
        >
          Download COCO annotation JSON
        </a>
        <a
          href="/api/export/counts"
          className="border border-neutral-400 bg-white px-3 py-1.5 text-center text-sm hover:bg-neutral-100"
        >
          Download Object Counts
        </a>
      </div>
    </div>
  );
}
