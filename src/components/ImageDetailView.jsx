"use client";

import { useState } from "react";
import ImageAnnotator from "./ImageAnnotator";
import AnnotationPanel from "./AnnotationPanel";

export default function ImageDetailView({ image, annotations: initialAnnotations, categories, onSelectedCategoryChange }) {
  const [annotations, setAnnotations] = useState(initialAnnotations);
  const [selectedId, setSelectedId] = useState(null);

  function handleSaved(merged) {
    setAnnotations((prev) => prev.map((a) => (a.id === merged.id ? merged : a)));
  }

  function handleSelect(id) {
    setSelectedId(id);
    if (onSelectedCategoryChange) {
      const annotation = annotations.find((a) => a.id === id);
      const category = annotation ? categories.find((c) => c.id === annotation.category_id) : null;
      onSelectedCategoryChange(category?.name ?? null);
    }
  }

  return (
    <div className="flex h-full min-h-0 gap-3">
      <ImageAnnotator
        image={image}
        annotations={annotations}
        categories={categories}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
      <div className="min-w-0 flex-1">
        <AnnotationPanel
          annotations={annotations}
          selectedId={selectedId}
          categories={categories}
          onSelect={handleSelect}
          onSaved={handleSaved}
        />
      </div>
    </div>
  );
}
