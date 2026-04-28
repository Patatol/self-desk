"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, Card, Input } from "@/components/ui/primitives";
import type { Note } from "@/lib/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
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
              <div key={note.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] p-2">
                <button className="w-full text-left" onClick={() => setSelectedId(note.id)}>
                  <p className="truncate text-sm font-medium">{note.title}</p>
                </button>
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
