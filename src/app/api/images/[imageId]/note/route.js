import { getImageNote, saveImageNote } from "@/lib/annotations";

export async function GET(request, { params }) {
  const { imageId } = await params;
  const id = Number(imageId);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "Invalid image id" }, { status: 400 });
  }

  const note = await getImageNote(id);
  return Response.json({ note });
}

export async function POST(request, { params }) {
  const { imageId } = await params;
  const id = Number(imageId);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "Invalid image id" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body?.text === "string" ? body.text : "";

  try {
    const updatedBy = request.cookies.get("pollen_user")?.value ?? null;
    const note = await saveImageNote(id, text, updatedBy);
    return Response.json({ note });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
