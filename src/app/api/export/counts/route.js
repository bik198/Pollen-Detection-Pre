import { getCategoryCounts } from "@/lib/annotations";

function csvEscape(value) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET() {
  const counts = await getCategoryCounts();
  const rows = [["category", "count"], ...counts.map((c) => [c.name, c.count])];
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="object_counts.csv"',
    },
  });
}
