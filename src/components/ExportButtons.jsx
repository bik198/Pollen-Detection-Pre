"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ExportButtons() {
  const pathname = usePathname();
  const imageId = pathname.match(/^\/image\/(\d+)/)?.[1] ?? null;
  const [top, setTop] = useState(24);

  useLayoutEffect(() => {
    if (!imageId) return;

    function syncTop() {
      const anchor = document.querySelector("[data-note-anchor]");
      if (anchor) setTop(anchor.getBoundingClientRect().top);
    }

    syncTop();
    window.addEventListener("resize", syncTop);
    return () => window.removeEventListener("resize", syncTop);
  }, [imageId, pathname]);

  if (!imageId) return null;

  return (
    <div
      className="fixed right-6 z-10 hidden w-48 flex-col gap-2 xl:flex"
      style={{ top }}
    >
      <ImageNoteForm key={imageId} imageId={imageId} />
    </div>
  );
}

function ImageNoteForm({ imageId }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("loading"); // loading | idle | saving | saved | error

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/images/${imageId}/note`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setText(data?.note?.text ?? "");
        setStatus("idle");
      })
      .catch(() => {
        if (!cancelled) setStatus("idle");
      });
    return () => {
      cancelled = true;
    };
  }, [imageId]);

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/images/${imageId}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-1 border border-neutral-400 bg-white p-2">
      <label htmlFor="image-note" className="font-mono text-xs text-neutral-500">
        Note for this image
      </label>
      <textarea
        id="image-note"
        rows={4}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStatus("idle");
        }}
        placeholder="Add a note for reviewers..."
        className="resize-none border border-neutral-300 px-2 py-1 text-sm"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={status === "saving" || status === "loading"}
        className="border border-neutral-400 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50"
      >
        {status === "saving" ? "Saving..." : "Save note"}
      </button>
      {status === "saved" && <p className="text-xs text-[#6b7a5e]">Note saved.</p>}
      {status === "error" && <p className="text-xs text-red-700">Save failed. Try again.</p>}
    </div>
  );
}
