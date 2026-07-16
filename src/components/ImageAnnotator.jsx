"use client";

import { colorForCategory } from "@/lib/categoryColors";

export default function ImageAnnotator({ image, annotations, categories, selectedId, onSelect }) {
  const name = image.extra?.name ?? image.file_name;
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const legendCounts = new Map();
  for (const annotation of annotations) {
    const category = categoryById.get(annotation.category_id);
    if (!category) continue;
    const key = labelText(category, annotation);
    legendCounts.set(key, (legendCounts.get(key) ?? 0) + 1);
  }

  return (
    <div className="relative border border-neutral-400 bg-neutral-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/image/${encodeURIComponent(name)}`}
        alt={name}
        className="block w-full"
      />

      <svg
        viewBox={`0 0 ${image.width} ${image.height}`}
        className="absolute inset-0 h-full w-full"
      >
        {annotations.map((annotation) => {
          const category = categoryById.get(annotation.category_id);
          if (!category) return null;
          const [x, y, w, h] = annotation.bbox;
          const isSelected = annotation.id === selectedId;
          const color = colorForCategory(category.name);
          return (
            <rect
              key={annotation.id}
              x={x}
              y={y}
              width={w}
              height={h}
              onClick={() => onSelect(annotation.id)}
              className="cursor-pointer"
              fill="transparent"
              stroke={color}
              strokeWidth={isSelected ? 10 : 4}
            />
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {annotations.map((annotation) => {
          const category = categoryById.get(annotation.category_id);
          if (!category) return null;
          const [x, y, w, h] = annotation.bbox;
          const isSelected = annotation.id === selectedId;
          const color = colorForCategory(category.name);
          return (
            <span
              key={annotation.id}
              className="pointer-events-none absolute whitespace-nowrap px-1 font-mono text-[11px] leading-tight text-black"
              style={{
                left: `${(x / image.width) * 100}%`,
                top: `${(y / image.height) * 100}%`,
                transform: "translateY(-100%)",
                backgroundColor: color,
                outline: isSelected ? "2px solid #262420" : "none",
              }}
            >
              {labelText(category, annotation)}
            </span>
          );
        })}
      </div>

      <div className="pointer-events-none absolute left-2 top-2 border border-neutral-400 bg-white/90 px-2 py-1.5">
        {[...legendCounts.entries()].map(([label, count]) => {
          const color = colorForCategory(label.split(" (")[0]);
          return (
            <div key={label} className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-800">
              <span className="inline-block h-2.5 w-2.5 shrink-0" style={{ backgroundColor: color }} />
              <span>
                {label} ({count})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function labelText(category, annotation) {
  let text = category.name;
  if (annotation.confidence_level) text += ` (${annotation.confidence_level})`;
  if (typeof annotation.dino_score === "number") text += ` ${annotation.dino_score.toFixed(2)}`;
  return text;
}
