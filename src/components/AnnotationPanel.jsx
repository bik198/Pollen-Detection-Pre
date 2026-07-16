"use client";

import { useState } from "react";

export default function AnnotationPanel({ annotations, selectedId, categories, onSelect, onSaved }) {
  const selected = annotations.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex h-full flex-col border border-neutral-400 bg-white">
      <div className="border-b border-neutral-300 px-3 py-2">
        <h2 className="text-sm font-semibold text-neutral-900">
          Objects <span className="font-mono text-xs text-neutral-500">({annotations.length})</span>
        </h2>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {annotations.map((annotation) => (
          <li key={annotation.id}>
            <button
              type="button"
              onClick={() => onSelect(annotation.id)}
              className={`block w-full border-b border-neutral-200 px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                annotation.id === selectedId ? "bg-[#6b7a5e]/10" : ""
              }`}
            >
              <span className="font-mono text-xs text-neutral-500">#{annotation.id}</span>{" "}
              {categoryName(categories, annotation.category_id)}
              {annotation.edited && (
                <span className="ml-1 font-mono text-[11px] text-[#6b7a5e]">
                  edited{annotation.editedBy ? ` (${annotation.editedBy})` : ""}
                </span>
              )}
              {annotation.confidence_level && (
                <span className="ml-1 font-mono text-[11px] text-neutral-400">
                  {annotation.confidence_level}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <EditForm
          key={selected.id}
          annotation={selected}
          categories={categories}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

function categoryName(categories, categoryId) {
  return categories.find((c) => c.id === categoryId)?.name ?? `id ${categoryId}`;
}

function EditForm({ annotation, categories, onSaved }) {
  const [categoryId, setCategoryId] = useState(annotation.category_id);
  const [status, setStatus] = useState("idle"); // idle | saving | error

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/annotations/${annotation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: Number(categoryId) }),
      });
      if (!res.ok) throw new Error("Save failed");
      const { annotation: merged } = await res.json();
      onSaved(merged);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="border-t border-neutral-300 p-3">
      <label className="block font-mono text-xs text-neutral-500" htmlFor="category-select">
        Label — annotation #{annotation.id}
      </label>
      <select
        id="category-select"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="mt-1 w-full border border-neutral-400 bg-white px-2 py-1.5 text-sm"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleSave}
        disabled={status === "saving"}
        className="mt-2 w-full border border-neutral-400 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50"
      >
        {status === "saving" ? "Saving..." : "Save"}
      </button>
      {status === "error" && (
        <p className="mt-1 text-xs text-red-700">Save failed. Try again.</p>
      )}
    </div>
  );
}
