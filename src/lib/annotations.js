import { ServerValue } from "firebase-admin/database";
import { getRtdb } from "./firebaseAdmin";

let cachedBase = null;

async function loadBase() {
  if (cachedBase) return cachedBase;
  const snap = await getRtdb().ref("/").once("value");
  const data = snap.val();
  if (!data) throw new Error("Realtime Database root has no annotations data");
  cachedBase = data;
  return cachedBase;
}

// Category id 0 is a placeholder supercategory row, not a real selectable label.
export async function getCategories() {
  const { categories } = await loadBase();
  return categories.filter((c) => c.id !== 0);
}

export async function getSortedImages() {
  const { images } = await loadBase();
  return [...images].sort((a, b) =>
    (a.extra?.name ?? a.file_name).localeCompare(b.extra?.name ?? b.file_name)
  );
}

export async function getImageById(imageId) {
  const { images } = await loadBase();
  return images.find((img) => img.id === imageId) ?? null;
}

async function rawAnnotationsForImage(imageId) {
  const { annotations } = await loadBase();
  return annotations.filter((a) => a.image_id === imageId);
}

async function getEditsForAnnotationIds(annotationIds) {
  if (annotationIds.length === 0) return new Map();
  const snap = await getRtdb().ref("/annotationEdits").once("value");
  const all = snap.val() ?? {};
  const edits = new Map();
  for (const id of annotationIds) {
    const edit = all[id];
    if (edit) edits.set(id, edit);
  }
  return edits;
}

export async function getAnnotationsForImage(imageId) {
  const raw = await rawAnnotationsForImage(imageId);
  const edits = await getEditsForAnnotationIds(raw.map((a) => a.id));
  return raw.map((a) => {
    const edit = edits.get(a.id);
    return {
      ...a,
      category_id: edit ? edit.categoryId : a.category_id,
      edited: Boolean(edit),
      editedBy: edit?.editedBy ?? null,
    };
  });
}

export async function getAnnotationSummaryForImages(imageIds) {
  // Counts per image for the gallery: total objects, low-confidence, unknown.
  const { annotations, categories } = await loadBase();
  const unknownId = categories.find((c) => c.name === "unknown_pollen")?.id;
  const byImage = new Map(imageIds.map((id) => [id, { total: 0, lowConfidence: 0, unknown: 0 }]));
  for (const a of annotations) {
    const entry = byImage.get(a.image_id);
    if (!entry) continue;
    entry.total += 1;
    if (a.confidence_level === "low") entry.lowConfidence += 1;
    if (a.category_id === unknownId) entry.unknown += 1;
  }
  return byImage;
}

export async function saveAnnotationEdit(annotationId, categoryId, editedBy) {
  const { annotations, categories } = await loadBase();
  const base = annotations.find((a) => a.id === annotationId);
  if (!base) throw new Error(`Unknown annotation id ${annotationId}`);

  const validIds = new Set(categories.filter((c) => c.id !== 0).map((c) => c.id));
  if (!validIds.has(categoryId)) {
    throw new Error(`Invalid category id ${categoryId}`);
  }

  await getRtdb().ref(`/annotationEdits/${annotationId}`).set({
    categoryId,
    previousCategoryId: base.category_id,
    editedBy: editedBy || null,
    updatedAt: ServerValue.TIMESTAMP,
  });

  return {
    ...base,
    category_id: categoryId,
    edited: true,
    editedBy: editedBy || null,
  };
}
