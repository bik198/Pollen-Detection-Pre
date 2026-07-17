"use client";

import { useEffect, useRef, useState } from "react";
import { colorForCategory } from "@/lib/categoryColors";

export default function ReferenceImageSlider({ images, activeSpecies }) {
  const scrollerRef = useRef(null);
  const cardRefs = useRef(new Map());
  const [selected, setSelected] = useState(null);

  function scrollBy(amount) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  useEffect(() => {
    if (!activeSpecies) return;
    cardRefs.current.get(activeSpecies)?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeSpecies]);

  if (images.length === 0) return null;

  return (
    <div className="flex h-full min-h-0 flex-col border border-neutral-400 bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-300 px-3 py-2">
        <h2 className="text-sm font-semibold text-neutral-900">
          Reference images{" "}
          <span className="font-mono text-xs text-neutral-500">({images.length})</span>
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-320)}
            className="border border-neutral-400 bg-white px-3 py-1 text-sm hover:bg-neutral-100"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollBy(320)}
            className="border border-neutral-400 bg-white px-3 py-1 text-sm hover:bg-neutral-100"
          >
            ›
          </button>
        </div>
      </div>
      <div ref={scrollerRef} className="flex min-h-0 flex-1 items-start gap-3 overflow-x-auto p-3">
        {images.map((image) => {
          const speciesName = image.file_name.replace(/\.[^.]+$/, "");
          const color = colorForCategory(speciesName);
          const hasMasks = Boolean(image.width && image.height);
          const isThisSelected = selected?.fileName === image.file_name;
          const isActiveSpecies = speciesName === activeSpecies;
          const selectedAnnotation = isThisSelected
            ? image.annotations.find((a) => a.id === selected.annotationId) ?? null
            : null;
          const zoom = selectedAnnotation ? computeZoom(selectedAnnotation, image) : null;

          function toggleSelect(annotationId) {
            setSelected(
              isThisSelected && selected.annotationId === annotationId
                ? null
                : { fileName: image.file_name, annotationId }
            );
          }

          return (
            <figure
              key={image.file_name}
              ref={(el) => {
                if (el) cardRefs.current.set(speciesName, el);
                else cardRefs.current.delete(speciesName);
              }}
              className={`shrink-0 overflow-hidden border bg-neutral-100 ${
                isActiveSpecies ? "border-2 border-red-600" : "border-neutral-300"
              }`}
            >
              <div
                className="relative h-64"
                style={hasMasks ? { aspectRatio: `${image.width} / ${image.height}` } : { width: "18rem" }}
              >
                <div
                  className="absolute inset-0 transition-transform duration-300 ease-out"
                  style={{
                    transform: zoom
                      ? `translate(${zoom.dx}%, ${zoom.dy}%) scale(${zoom.scale})`
                      : "translate(0%, 0%) scale(1)",
                    transformOrigin: zoom ? `${zoom.cx}% ${zoom.cy}%` : "50% 50%",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/reference-image/${encodeURIComponent(image.file_name)}`}
                    alt={image.file_name}
                    className="block h-full w-full object-cover"
                  />
                  {hasMasks && (
                    <svg
                      viewBox={`0 0 ${image.width} ${image.height}`}
                      className="absolute inset-0 h-full w-full"
                    >
                      {image.annotations.map((annotation) => {
                        const isSelected = annotation.id === selected?.annotationId && isThisSelected;
                        return (annotation.segmentation ?? []).map((ring, ringIndex) => (
                          <polygon
                            key={`${annotation.id}-${ringIndex}`}
                            points={pointsToString(ring)}
                            onClick={() => toggleSelect(annotation.id)}
                            className="cursor-pointer"
                            fill="transparent"
                            stroke={color}
                            strokeWidth={isSelected ? 16 : 10}
                          />
                        ));
                      })}
                    </svg>
                  )}
                </div>
              </div>
              <figcaption className="shrink-0 truncate border-t border-neutral-300 px-1.5 py-1 font-mono text-[11px] text-neutral-600">
                {speciesName}
              </figcaption>
            </figure>
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
  const targetFrac = 0.8;
  const rawScale = Math.min(targetFrac / widthFrac, targetFrac / heightFrac);
  const scale = Math.min(Math.max(rawScale, 1.8), 6);
  return { cx, cy, scale, dx: 50 - cx, dy: 50 - cy };
}

function pointsToString(ring) {
  const points = [];
  for (let i = 0; i < ring.length; i += 2) {
    points.push(`${ring[i]},${ring[i + 1]}`);
  }
  return points.join(" ");
}

