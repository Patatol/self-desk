"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, Card, Input } from "@/components/ui/primitives";
import type { StoredFile } from "@/lib/types";

export default function FilesPage() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "images" | "documents" | "others">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadFiles() {
    const response = await fetch("/api/files");
    if (!response.ok) return;
    const data = (await response.json()) as StoredFile[];
    setFiles(data);
  }

  useEffect(() => {
    const run = async () => {
      await loadFiles();
    };
    void run();
  }, []);

  function getFileCategory(file: StoredFile): "images" | "documents" | "others" {
    if (file.path.startsWith("images/")) return "images";
    if (file.path.startsWith("documents/")) return "documents";
    return "others";
  }

  const filtered = useMemo(
    () =>
      files.filter((file) => {
        const matchesName = file.file_name.toLowerCase().includes(query.toLowerCase());
        const matchesType = typeFilter === "all" ? true : getFileCategory(file) === typeFilter;
        return matchesName && matchesType;
      }),
    [files, query, typeFilter],
  );

  async function renameFile(id: string) {
    if (!renameValue.trim()) return;
    setBusyId(id);
    const response = await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_name: renameValue.trim() }),
    });
    setBusyId(null);
    if (!response.ok) return;
    const updated = (await response.json()) as StoredFile;
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, ...updated } : file)));
    setRenamingId(null);
    setRenameValue("");
  }

  async function deleteFile(id: string) {
    if (!confirm("Delete this file permanently?")) return;
    setBusyId(id);
    const response = await fetch(`/api/files/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!response.ok) return;
    setFiles((prev) => prev.filter((file) => file.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  }

  async function bulkDelete() {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} selected files permanently?`)) return;
    setBusyId("bulk");
    const response = await fetch("/api/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });
    setBusyId(null);
    if (!response.ok) return;
    setFiles((prev) => prev.filter((file) => !selectedIds.includes(file.id)));
    setSelectedIds([]);
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((item) => item !== id)));
  }

  return (
    <AppShell title="Files">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Input
            className="w-full md:max-w-sm"
            placeholder="Search files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "images", "documents", "others"] as const).map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "primary" : "secondary"}
                className="px-2 py-1 text-xs capitalize"
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <input
              type="checkbox"
              checked={filtered.length > 0 && filtered.every((file) => selectedIds.includes(file.id))}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds((prev) => [...new Set([...prev, ...filtered.map((f) => f.id)])]);
                } else {
                  setSelectedIds((prev) => prev.filter((id) => !filtered.some((f) => f.id === id)));
                }
              }}
            />
            Select all filtered
          </label>
          <Button
            variant="ghost"
            className="px-2 py-1 text-xs text-red-600"
            disabled={!selectedIds.length || busyId === "bulk"}
            onClick={() => void bulkDelete()}
          >
            Delete selected ({selectedIds.length})
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((file) => (
            <Card key={file.id} className="space-y-2 p-3">
              <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(file.id)}
                  onChange={(e) => toggleSelected(file.id, e.target.checked)}
                />
                Select
              </label>
              {renamingId === file.id ? (
                <div className="space-y-2">
                  <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
                  <div className="flex gap-2">
                    <Button
                      className="px-2 py-1 text-xs"
                      disabled={busyId === file.id}
                      onClick={() => void renameFile(file.id)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-2 py-1 text-xs"
                      onClick={() => {
                        setRenamingId(null);
                        setRenameValue("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="truncate font-medium">{file.file_name}</p>
              )}
              <p className="text-xs text-[var(--muted)]">{file.mime_type}</p>
              <p className="text-xs capitalize text-[var(--muted)]">{getFileCategory(file)}</p>
              <p className="text-xs text-[var(--muted)]">{Math.max(1, Math.round(file.size_bytes / 1024))} KB</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={file.file_url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring rounded-lg border border-[var(--border)] px-2 py-1 text-xs"
                >
                  Open
                </a>
                <Button
                  variant="secondary"
                  className="px-2 py-1 text-xs"
                  onClick={() => {
                    setRenamingId(file.id);
                    setRenameValue(file.file_name);
                  }}
                >
                  Rename
                </Button>
                <Button
                  variant="ghost"
                  className="px-2 py-1 text-xs text-red-600"
                  disabled={busyId === file.id}
                  onClick={() => void deleteFile(file.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
        {!filtered.length ? <p className="text-sm text-[var(--muted)]">No files uploaded yet.</p> : null}
      </div>
    </AppShell>
  );
}
