"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PasscodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const res = await fetch("/api/passcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, code }),
    });

    if (!res.ok) {
      setSubmitting(false);
      setError(true);
      setCode("");
      return;
    }

    const destination = searchParams.get("from") || "/";
    router.replace(destination);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs border border-neutral-400 bg-white p-6"
      >
        <h1 className="mb-4 font-mono text-sm text-neutral-800">Enter passcode</h1>
        <label className="block font-mono text-xs text-neutral-500" htmlFor="username-input">
          Name
        </label>
        <input
          id="username-input"
          type="text"
          maxLength={40}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          className="mb-3 mt-1 w-full border border-neutral-400 px-3 py-2 text-sm"
        />
        <label className="block font-mono text-xs text-neutral-500" htmlFor="passcode-input">
          Passcode
        </label>
        <input
          id="passcode-input"
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="mb-3 mt-1 w-full border border-neutral-400 px-3 py-2 font-mono text-lg tracking-widest"
        />
        {error && (
          <p className="mb-3 font-mono text-xs text-red-700">Incorrect passcode.</p>
        )}
        <button
          type="submit"
          disabled={submitting || code.length !== 4 || !username.trim()}
          className="w-full border border-neutral-400 bg-white px-3 py-1.5 hover:bg-neutral-100 disabled:opacity-50"
        >
          {submitting ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
