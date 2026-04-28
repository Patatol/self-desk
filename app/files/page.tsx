"use client";

import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/app-nav";
import type { StoredFile } from "@/lib/types";

export default function FilesPage() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const run = async () => {
      const response = await fetch("/api/files");
      if (!response.ok) return;
      const data = (await response.json()) as StoredFile[];
      setFiles(data);
    };
    void run();
  }, []);

  const filtered = useMemo(
    () => files.filter((file) => file.file_name.toLowerCase().includes(query.toLowerCase())),
    [files, query],
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppNav />
      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
        <input
          className="w-full rounded border border-zinc-300 bg-white px-3 py-2"
          placeholder="Search files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <section className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4">
          {filtered.map((file) => (
            <article key={file.id} className="rounded border border-zinc-200 p-3">
              <p className="font-medium">{file.file_name}</p>
              <p className="text-xs text-zinc-600">{file.mime_type}</p>
              <p className="text-xs text-zinc-600">{Math.round(file.size_bytes / 1024)} KB</p>
            </article>
          ))}
          {!filtered.length ? <p className="text-sm text-zinc-600">No files uploaded yet.</p> : null}
        </section>
      </main>
    </div>
  );
}
