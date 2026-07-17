import { notFound } from "next/navigation";
import {
  getImageById,
  getSortedImages,
  getAnnotationsForImage,
  getCategories,
  getReferenceImages,
} from "@/lib/annotations";
import { listReferenceImages } from "@/lib/drive";
import PrevNextNav from "@/components/PrevNextNav";
import ImagePageBody from "@/components/ImagePageBody";

export default async function ImageDetailPage({ params }) {
  const { id } = await params;
  const imageId = Number(id);

  const image = await getImageById(imageId);
  if (!image) notFound();

  const sortedImages = await getSortedImages();
  const index = sortedImages.findIndex((img) => img.id === imageId);

  const [annotations, categories, referenceFilenames, referenceData] = await Promise.all([
    getAnnotationsForImage(imageId),
    getCategories(),
    listReferenceImages().catch(() => []),
    getReferenceImages().catch(() => []),
  ]);

  const referenceByFilename = new Map(referenceData.map((r) => [r.file_name, r]));
  const referenceImages = referenceFilenames.map((file_name) => {
    const data = referenceByFilename.get(file_name);
    return {
      file_name,
      width: data?.width ?? null,
      height: data?.height ?? null,
      annotations: data?.annotations ?? [],
    };
  });

  return (
    <main className="mx-auto flex h-screen max-w-7xl flex-col px-4">
      <div className="shrink-0 pt-3">
        <PrevNextNav
          prevImage={sortedImages[index - 1] ?? null}
          nextImage={sortedImages[index + 1] ?? null}
        />
        <p className="mt-2 font-mono text-xs text-neutral-500">
          {image.extra?.name ?? image.file_name}
        </p>
      </div>
      <ImagePageBody
        key={image.id}
        image={image}
        annotations={annotations}
        categories={categories}
        referenceImages={referenceImages}
      />
    </main>
  );
}
