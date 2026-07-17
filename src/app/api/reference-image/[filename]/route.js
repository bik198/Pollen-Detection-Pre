import { Readable } from "node:stream";
import { lookupReferenceFile, streamDriveFile } from "@/lib/drive";

export async function GET(request, { params }) {
  const { filename } = await params;

  const entry = await lookupReferenceFile(decodeURIComponent(filename));
  if (!entry) {
    return new Response("Not found in Drive folder", { status: 404 });
  }

  const nodeStream = await streamDriveFile(entry.fileId);
  const webStream = Readable.toWeb(nodeStream);

  return new Response(webStream, {
    headers: {
      "Content-Type": entry.mimeType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
