"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, Card, Input } from "@/components/ui/primitives";
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
    <AppShell title="Global Search">
      <div className="space-y-3">
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={runSearch}>
          <Input
            className="flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, notes, files..."
          />
          <Button type="submit">Search</Button>
        </form>
        <section className="grid gap-3 lg:grid-cols-3">
          <Card className="p-3">
            <h2 className="text-sm font-semibold">Messages</h2>
            <div className="mt-2 space-y-2 text-sm">
              {result.messages.map((item) => (
                <p key={item.id} className="line-clamp-2">
                  {item.content}
                </p>
              ))}
              {!result.messages.length ? <p className="text-[var(--muted)]">No matches</p> : null}
            </div>
          </Card>
          <Card className="p-3">
            <h2 className="text-sm font-semibold">Notes</h2>
            <div className="mt-2 space-y-2 text-sm">
              {result.notes.map((item) => (
                <p key={item.id} className="line-clamp-2">
                  {item.title}
                </p>
              ))}
              {!result.notes.length ? <p className="text-[var(--muted)]">No matches</p> : null}
            </div>
          </Card>
          <Card className="p-3">
            <h2 className="text-sm font-semibold">Files</h2>
            <div className="mt-2 space-y-2 text-sm">
              {result.files.map((item) => (
                <p key={item.id} className="line-clamp-2">
                  {item.file_name}
                </p>
              ))}
              {!result.files.length ? <p className="text-[var(--muted)]">No matches</p> : null}
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
