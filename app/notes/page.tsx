"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, Card, Input } from "@/components/ui/primitives";
import type { Note } from "@/lib/types";

type NoteStatus = "idea" | "in_progress" | "done" | "archived";
type NoteMeta = { status: NoteStatus; color: string };

const statusOptions: { value: NoteStatus; label: string; color: string }[] = [
  { value: "idea", label: "Idea", color: "text-blue-600" },
  { value: "in_progress", label: "In Progress", color: "text-amber-600" },
  { value: "done", label: "Done", color: "text-emerald-600" },
  { value: "archived", label: "Archived", color: "text-zinc-500" },
];

const noteColors = ["#ffffff", "#e0f2fe", "#fef3c7", "#dcfce7", "#fce7f3", "#ede9fe"];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [meta, setMeta] = useState<Record<string, NoteMeta>>(() => {
    if (typeof window === "undefined") return {};
    const stored = localStorage.getItem("selfdesk-note-meta");
    if (!stored) return {};
    try {
      return JSON.parse(stored) as Record<string, NoteMeta>;
    } catch {
      return {};
    }
  });
  const selected = notes.find((n) => n.id === selectedId) ?? null;

  async function loadNotes() {
    const response = await fetch("/api/notes");
    if (!response.ok) return;
    const data = (await response.json()) as Note[];
    setNotes(data);
    if (!selectedId && data[0]) setSelectedId(data[0].id);
  }

  useEffect(() => {
    const run = async () => {
      const response = await fetch("/api/notes");
      if (!response.ok) return;
      const data = (await response.json()) as Note[];
      setNotes(data);
      if (data[0]) setSelectedId(data[0].id);
    };
    void run();
  }, []);

  useEffect(() => {
    localStorage.setItem("selfdesk-note-meta", JSON.stringify(meta));
  }, [meta]);

  const filtered = useMemo(
    () =>
      notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase()),
      ),
    [notes, query],
  );

  async function createNote() {
    const title = prompt("Note title");
    if (!title) return;
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: "" }),
    });
    await loadNotes();
  }

  async function saveNote() {
    if (!selected) return;
    await fetch(`/api/notes/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: selected.title, content: selected.content }),
    });
    await loadNotes();
  }

  async function deleteNote(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    setSelectedId(remaining[0]?.id ?? "");
    setMeta((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function getNoteMeta(id: string): NoteMeta {
    return meta[id] ?? { status: "idea", color: "#ffffff" };
  }

  return (
    <AppShell title="Notes">
      <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
        <Card className="space-y-3 p-3">
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Search notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={createNote}>New</Button>
          </div>
          <div className="max-h-[60dvh] space-y-2 overflow-y-auto">
            {filtered.map((note) => (
              <div
                key={note.id}
                className={`rounded-xl border p-2 transition-colors ${
                  selectedId === note.id ? "border-[var(--accent-strong)] ring-1 ring-[var(--accent-strong)]" : "border-[var(--border)]"
                }`}
                style={{ backgroundColor: getNoteMeta(note.id).color }}
              >
                <button className="w-full text-left" onClick={() => setSelectedId(note.id)}>
                  <p className="truncate text-sm font-medium">{note.title}</p>
                </button>
                <p
                  className={`mt-1 text-[11px] font-medium ${
                    statusOptions.find((s) => s.value === getNoteMeta(note.id).status)?.color ?? "text-zinc-500"
                  }`}
                >
                  {statusOptions.find((s) => s.value === getNoteMeta(note.id).status)?.label ?? "Idea"}
                </p>
                <button className="mt-1 text-xs text-red-500" onClick={() => void deleteNote(note.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-3 p-3 md:p-4">
          {selected ? (
            <>
              <Input
                className="text-base font-semibold"
                value={selected.title}
                onChange={(e) =>
                  setNotes((prev) => prev.map((n) => (n.id === selected.id ? { ...n, title: e.target.value } : n)))
                }
              />
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm"
                  value={getNoteMeta(selected.id).status}
                  onChange={(e) =>
                    setMeta((prev) => ({
                      ...prev,
                      [selected.id]: { ...getNoteMeta(selected.id), status: e.target.value as NoteStatus },
                    }))
                  }
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  {noteColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-6 w-6 rounded-full border ${
                        getNoteMeta(selected.id).color === color ? "ring-2 ring-[var(--accent-strong)]" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setMeta((prev) => ({
                          ...prev,
                          [selected.id]: { ...getNoteMeta(selected.id), color },
                        }))
                      }
                      aria-label={`Set note color ${color}`}
                    />
                  ))}
                </div>
              </div>
              <textarea
                className="focus-ring h-[56dvh] w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 font-mono text-sm"
                value={selected.content}
                onChange={(e) =>
                  setNotes((prev) => prev.map((n) => (n.id === selected.id ? { ...n, content: e.target.value } : n)))
                }
              />
              <div className="flex justify-end">
                <Button onClick={saveNote}>Save note</Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">Create or select a note.</p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
