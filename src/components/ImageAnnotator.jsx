"use client";

import { useRef, useState } from "react";
import { colorForCategory } from "@/lib/categoryColors";

const SPOTLIGHT_PADDING = 10;
const DEFAULT_LEGEND_POS = { x: 8, y: 8 };

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

  const selectedAnnotation = annotations.find((a) => a.id === selectedId) ?? null;
  const selectedCategory = selectedAnnotation
    ? categoryById.get(selectedAnnotation.category_id)
    : null;
  const zoom = selectedAnnotation ? computeZoom(selectedAnnotation, image) : null;

  const containerRef = useRef(null);
  const legendRef = useRef(null);
  const [legendPos, setLegendPos] = useState(DEFAULT_LEGEND_POS);

  function handleLegendPointerDown(e) {
    const container = containerRef.current;
    const legend = legendRef.current;
    if (!container || !legend) return;
    e.preventDefault();

    const containerRect = container.getBoundingClientRect();
    const legendRect = legend.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = legendPos;
    const maxX = Math.max(containerRect.width - legendRect.width, 0);
    const maxY = Math.max(containerRect.height - legendRect.height, 0);

    function handleMove(moveEvent) {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setLegendPos({
        x: Math.min(Math.max(startPos.x + dx, 0), maxX),
        y: Math.min(Math.max(startPos.y + dy, 0), maxY),
      });
    }

    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full shrink-0 overflow-hidden border border-neutral-400 bg-neutral-100"
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      <div
        className="relative transition-transform duration-300 ease-out"
        style={{
          transform: zoom
            ? `translate(${zoom.dx}%, ${zoom.dy}%) scale(${zoom.scale})`
            : "translate(0%, 0%) scale(1)",
          transformOrigin: zoom ? `${zoom.cx}% ${zoom.cy}%` : "50% 50%",
        }}
      >
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
            const isSelected = annotation.id === selectedId;
            const isHidden = Boolean(selectedId) && !isSelected;
            const color = colorForCategory(category.name);
            return (annotation.segmentation ?? []).map((ring, ringIndex) => (
              <polygon
                key={`${annotation.id}-${ringIndex}`}
                points={pointsToString(ring)}
                onClick={() => onSelect(isSelected ? null : annotation.id)}
                className="cursor-pointer"
                fill="transparent"
                stroke={isHidden ? "transparent" : color}
                strokeWidth={isSelected ? 8 : 3}
              />
            ));
          })}

          {selectedAnnotation && (
            <>
              <mask id="spotlight-mask">
                <rect x="0" y="0" width={image.width} height={image.height} fill="white" />
                <rect
                  x={selectedAnnotation.bbox[0] - SPOTLIGHT_PADDING}
                  y={selectedAnnotation.bbox[1] - SPOTLIGHT_PADDING}
                  width={selectedAnnotation.bbox[2] + SPOTLIGHT_PADDING * 2}
                  height={selectedAnnotation.bbox[3] + SPOTLIGHT_PADDING * 2}
                  fill="black"
                />
              </mask>
              <rect
                x="0"
                y="0"
                width={image.width}
                height={image.height}
                fill="black"
                fillOpacity="0.6"
                mask="url(#spotlight-mask)"
                className="pointer-events-none"
              />
              {(selectedAnnotation.segmentation ?? []).map((ring, ringIndex) => (
                <polygon
                  key={`selected-${ringIndex}`}
                  points={pointsToString(ring)}
                  fill="transparent"
                  stroke={selectedCategory ? colorForCategory(selectedCategory.name) : "#e2b93b"}
                  strokeWidth={8}
                  className="pointer-events-none"
                />
              ))}
            </>
          )}
        </svg>

        <div className="pointer-events-none absolute inset-0">
          {annotations
            .filter((annotation) => !selectedId || annotation.id === selectedId)
            .map((annotation) => {
              const category = categoryById.get(annotation.category_id);
              if (!category) return null;
              const [x, y] = annotation.bbox;
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
      </div>

      <div
        ref={legendRef}
        onPointerDown={handleLegendPointerDown}
        className="absolute touch-none cursor-move select-none border border-neutral-400 bg-white/90 px-2 py-1.5"
        style={{ left: legendPos.x, top: legendPos.y }}
      >
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

function computeZoom(annotation, image) {
  const [x, y, w, h] = annotation.bbox;
  const cx = ((x + w / 2) / image.width) * 100;
  const cy = ((y + h / 2) / image.height) * 100;
  const widthFrac = w / image.width;
  const heightFrac = h / image.height;
  const targetFrac = 0.45;
  const rawScale = Math.min(targetFrac / widthFrac, targetFrac / heightFrac);
  const scale = Math.min(Math.max(rawScale, 1.4), 4);
  return { cx, cy, scale, dx: 50 - cx, dy: 50 - cy };
}

function pointsToString(ring) {
  const points = [];
  for (let i = 0; i < ring.length; i += 2) {
    points.push(`${ring[i]},${ring[i + 1]}`);
  }
  return points.join(" ");
}

function labelText(category, annotation) {
  let text = category.name;
  if (annotation.confidence_level) text += ` (${annotation.confidence_level})`;
  if (typeof annotation.dino_score === "number") text += ` ${annotation.dino_score.toFixed(2)}`;
  return text;
}
