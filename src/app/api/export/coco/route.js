import { getFullCocoExport } from "@/lib/annotations";

export async function GET() {
  const data = await getFullCocoExport();
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="annotations_species_export.json"',
    },
  });
}
