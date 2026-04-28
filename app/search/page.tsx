"use client";

import { useState } from "react";
import { AppNav } from "@/components/app-nav";
import type { Message, Note, StoredFile } from "@/lib/types";

type SearchResult = {
  messages: Message[];
  notes: Note[];
  files: StoredFile[];
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult>({ messages: [], notes: [], files: [] });

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) return;
    const data = (await response.json()) as SearchResult;
    setResult(data);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppNav />
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-6">
        <form className="flex gap-2" onSubmit={runSearch}>
          <input
            className="flex-1 rounded border border-zinc-300 bg-white px-3 py-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, notes, files..."
          />
          <button className="rounded bg-zinc-900 px-4 py-2 text-white" type="submit">
            Search
          </button>
        </form>
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded border border-zinc-200 bg-white p-3">
            <h2 className="font-semibold">Messages</h2>
            <div className="mt-2 space-y-2 text-sm">
              {result.messages.map((item) => (
                <p key={item.id}>{item.content}</p>
              ))}
            </div>
          </div>
          <div className="rounded border border-zinc-200 bg-white p-3">
            <h2 className="font-semibold">Notes</h2>
            <div className="mt-2 space-y-2 text-sm">
              {result.notes.map((item) => (
                <p key={item.id}>{item.title}</p>
              ))}
            </div>
          </div>
          <div className="rounded border border-zinc-200 bg-white p-3">
            <h2 className="font-semibold">Files</h2>
            <div className="mt-2 space-y-2 text-sm">
              {result.files.map((item) => (
                <p key={item.id}>{item.file_name}</p>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
