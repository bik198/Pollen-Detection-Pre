"use client";

import { useState } from "react";
import ImageAnnotator from "./ImageAnnotator";
import AnnotationPanel from "./AnnotationPanel";

export default function ImageDetailView({ image, annotations: initialAnnotations, categories }) {
  const [annotations, setAnnotations] = useState(initialAnnotations);
  const [selectedId, setSelectedId] = useState(initialAnnotations[0]?.id ?? null);

  function handleSaved(merged) {
    setAnnotations((prev) => prev.map((a) => (a.id === merged.id ? merged : a)));
  }

  return (
    <div className="grid grid-cols-1 gap-3 py-3 lg:grid-cols-[70%_1fr]">
      <ImageAnnotator
        image={image}
        annotations={annotations}
        categories={categories}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <AnnotationPanel
        annotations={annotations}
        selectedId={selectedId}
        categories={categories}
        onSelect={setSelectedId}
        onSaved={handleSaved}
      />
    </div>
  );
}
