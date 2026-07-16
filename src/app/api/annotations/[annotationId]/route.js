import { saveAnnotationEdit } from "@/lib/annotations";

export async function POST(request, { params }) {
  const { annotationId } = await params;
  const id = Number(annotationId);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const categoryId = Number(body?.categoryId);
  if (!Number.isInteger(categoryId)) {
    return Response.json({ error: "categoryId is required" }, { status: 400 });
  }

  try {
    const editedBy = request.cookies.get("pollen_user")?.value ?? null;
    const merged = await saveAnnotationEdit(id, categoryId, editedBy);
    return Response.json({ annotation: merged });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
