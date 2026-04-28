"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, Input } from "@/components/ui/primitives";
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
    <AppShell title="Files">
      <div className="space-y-3">
        <Input
          className="w-full md:max-w-sm"
          placeholder="Search files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((file) => (
            <Card key={file.id} className="space-y-2 p-3">
              <p className="truncate font-medium">{file.file_name}</p>
              <p className="text-xs text-[var(--muted)]">{file.mime_type}</p>
              <p className="text-xs text-[var(--muted)]">{Math.max(1, Math.round(file.size_bytes / 1024))} KB</p>
            </Card>
          ))}
        </div>
        {!filtered.length ? <p className="text-sm text-[var(--muted)]">No files uploaded yet.</p> : null}
      </div>
    </AppShell>
  );
}
