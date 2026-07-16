import { notFound } from "next/navigation";
import {
  getImageById,
  getSortedImages,
  getAnnotationsForImage,
  getCategories,
} from "@/lib/annotations";
import PrevNextNav from "@/components/PrevNextNav";
import ImageDetailView from "@/components/ImageDetailView";

export default async function ImageDetailPage({ params }) {
  const { id } = await params;
  const imageId = Number(id);

  const image = await getImageById(imageId);
  if (!image) notFound();

  const sortedImages = await getSortedImages();
  const index = sortedImages.findIndex((img) => img.id === imageId);

  const [annotations, categories] = await Promise.all([
    getAnnotationsForImage(imageId),
    getCategories(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4">
      <PrevNextNav
        prevImage={sortedImages[index - 1] ?? null}
        nextImage={sortedImages[index + 1] ?? null}
      />
      <p className="mt-2 font-mono text-xs text-neutral-500">
        {image.extra?.name ?? image.file_name}
      </p>
      <ImageDetailView image={image} annotations={annotations} categories={categories} />
    </main>
  );
}
