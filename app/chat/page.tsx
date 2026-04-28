"use client";

import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/app-nav";
import type { Message } from "@/lib/types";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadMessages() {
    const response = await fetch("/api/messages");
    if (!response.ok) return;
    const data = (await response.json()) as Message[];
    setMessages(data);
  }

  useEffect(() => {
    const run = async () => {
      const response = await fetch("/api/messages");
      if (!response.ok) return;
      const data = (await response.json()) as Message[];
      setMessages(data);
    };
    void run();
  }, []);

  const filtered = useMemo(
    () => messages.filter((m) => m.content.toLowerCase().includes(query.toLowerCase())),
    [messages, query],
  );

  async function sendText(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim(), type: "text" }),
    });
    setText("");
    await loadMessages();
  }

  async function uploadFile(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const uploadResponse = await fetch("/api/upload", { method: "POST", body: formData });
    if (uploadResponse.ok) {
      const uploaded = await uploadResponse.json();
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: uploaded.file_name,
          type: "file",
          file_url: uploaded.file_url,
          file_name: uploaded.file_name,
          mime_type: uploaded.mime_type,
        }),
      });
      await loadMessages();
    }
    setUploading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppNav />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-3">
          <input
            placeholder="Search messages..."
            className="w-full rounded border border-zinc-300 px-3 py-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <section className="h-[60vh] space-y-3 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-4">
          {filtered.map((message) => (
            <article key={message.id} className="rounded-lg bg-zinc-100 p-3">
              <p className="text-sm">{message.content}</p>
              {message.file_url ? (
                <a className="text-sm text-blue-700 underline" href={message.file_url} target="_blank" rel="noreferrer">
                  Open file
                </a>
              ) : null}
              <p className="mt-2 text-xs text-zinc-600">{new Date(message.created_at).toLocaleString()}</p>
            </article>
          ))}
        </section>
        <form onSubmit={sendText} className="flex gap-2 rounded-lg border border-zinc-200 bg-white p-3">
          <input
            className="flex-1 rounded border border-zinc-300 px-3 py-2"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <label className="cursor-pointer rounded border border-zinc-300 px-3 py-2 text-sm">
            {uploading ? "Uploading..." : "Attach"}
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(file);
              }}
            />
          </label>
          <button className="rounded bg-zinc-900 px-4 py-2 text-white" type="submit">
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
