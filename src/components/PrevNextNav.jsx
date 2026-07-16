import Link from "next/link";

export default function PrevNextNav({ prevImage, nextImage }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-300 py-2">
      <Link
        href="/"
        className="border border-neutral-400 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
      >
        All images
      </Link>
      <div className="flex gap-2">
        {prevImage ? (
          <Link
            href={`/image/${prevImage.id}`}
            className="border border-neutral-400 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            Prev
          </Link>
        ) : (
          <span className="border border-neutral-200 px-3 py-1.5 text-sm text-neutral-400">
            Prev
          </span>
        )}
        {nextImage ? (
          <Link
            href={`/image/${nextImage.id}`}
            className="border border-neutral-400 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            Next
          </Link>
        ) : (
          <span className="border border-neutral-200 px-3 py-1.5 text-sm text-neutral-400">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
