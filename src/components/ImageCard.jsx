import Link from "next/link";

export default function ImageCard({ image, summary }) {
  const name = image.extra?.name ?? image.file_name;

  return (
    <Link
      href={`/image/${image.id}`}
      className="group block border border-neutral-400 bg-white hover:border-[#6b7a5e]"
    >
      <div className="aspect-[16/9] overflow-hidden border-b border-neutral-300 bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/image/${encodeURIComponent(name)}`}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="px-2 py-1.5">
        <p className="truncate font-mono text-xs text-neutral-800">{name}</p>
        <p className="mt-0.5 font-mono text-[11px] text-neutral-500">
          {summary.total} objects
          {summary.lowConfidence > 0 && ` · ${summary.lowConfidence} low-confidence`}
          {summary.unknown > 0 && ` · ${summary.unknown} unknown`}
        </p>
      </div>
    </Link>
  );
}
