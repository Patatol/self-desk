"use client";

import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/app-nav";
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
    <div className="min-h-screen bg-zinc-50">
      <AppNav />
      <main className="mx-auto grid w-full max-w-6xl grid-cols-[320px_1fr] gap-4 px-4 py-6">
        <aside className="space-y-3 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex gap-2">
            <input
              className="flex-1 rounded border border-zinc-300 px-3 py-2"
              placeholder="Search notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="rounded bg-zinc-900 px-3 py-2 text-white" onClick={createNote}>
              New
            </button>
          </div>
          <div className="space-y-2">
            {filtered.map((note) => (
              <div key={note.id} className="rounded border border-zinc-200 p-2">
                <button className="w-full text-left" onClick={() => setSelectedId(note.id)}>
                  <p className="font-medium">{note.title}</p>
                </button>
                <button className="mt-1 text-xs text-red-600" onClick={() => void deleteNote(note.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </aside>
        <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
          {selected ? (
            <>
              <input
                className="w-full rounded border border-zinc-300 px-3 py-2 text-lg font-semibold"
                value={selected.title}
                onChange={(e) =>
                  setNotes((prev) => prev.map((n) => (n.id === selected.id ? { ...n, title: e.target.value } : n)))
                }
              />
              <textarea
                className="h-[58vh] w-full rounded border border-zinc-300 px-3 py-2 font-mono text-sm"
                value={selected.content}
                onChange={(e) =>
                  setNotes((prev) => prev.map((n) => (n.id === selected.id ? { ...n, content: e.target.value } : n)))
                }
              />
              <button className="rounded bg-zinc-900 px-4 py-2 text-white" onClick={saveNote}>
                Save
              </button>
            </>
          ) : (
            <p className="text-zinc-600">Create or select a note.</p>
          )}
        </section>
      </main>
    </div>
  );
}
