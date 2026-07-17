export default function ExportButtons() {
  return (
    <div className="fixed right-6 top-6 z-10 hidden w-48 flex-col gap-2 xl:flex">
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
  );
}
