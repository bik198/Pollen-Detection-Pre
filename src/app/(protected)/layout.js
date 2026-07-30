import ExportButtons from "@/components/ExportButtons";
import CategoryCountsPanel from "@/components/CategoryCountsPanel";

export default function ProtectedLayout({ children }) {
  return (
    <>
      <CategoryCountsPanel />
      <ExportButtons />
      {children}
    </>
  );
}
