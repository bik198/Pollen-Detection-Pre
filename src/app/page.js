import { getSortedImages, getAnnotationSummaryForImages } from "@/lib/annotations";
import ImageGrid from "@/components/ImageGrid";

export default async function GalleryPage() {
  const images = await getSortedImages();
  const summaries = await getAnnotationSummaryForImages(images.map((img) => img.id));

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-5 border-b border-neutral-300 pb-3">
        <h1 className="text-lg font-semibold text-neutral-900">Pollen annotation review</h1>
        <p className="mt-1 font-mono text-xs text-neutral-500">{images.length} images</p>
      </header>
      <ImageGrid images={images} summaries={summaries} />
    </main>
  );
}
