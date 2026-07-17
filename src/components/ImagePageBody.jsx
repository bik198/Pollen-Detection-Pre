"use client";

import { useState } from "react";
import ImageDetailView from "./ImageDetailView";
import ReferenceImageSlider from "./ReferenceImageSlider";

export default function ImagePageBody({ image, annotations, categories, referenceImages }) {
  const [activeSpecies, setActiveSpecies] = useState(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 py-3">
      <div className="min-h-0 flex-1">
        <ImageDetailView
          image={image}
          annotations={annotations}
          categories={categories}
          onSelectedCategoryChange={setActiveSpecies}
        />
      </div>
      <div className="min-h-0 flex-1">
        <ReferenceImageSlider images={referenceImages} activeSpecies={activeSpecies} />
      </div>
    </div>
  );
}
