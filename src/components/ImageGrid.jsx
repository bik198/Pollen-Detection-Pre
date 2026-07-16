import ImageCard from "./ImageCard";

export default function ImageGrid({ images, summaries }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          summary={summaries.get(image.id) ?? { total: 0, lowConfidence: 0, unknown: 0 }}
        />
      ))}
    </div>
  );
}
