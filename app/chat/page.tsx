"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, Card, Input } from "@/components/ui/primitives";
import type { Message } from "@/lib/types";
import { Bold, Code2, Italic, Paperclip, SendHorizontal } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

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

  async function sendCurrentMessage() {
    if (!text.trim()) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim(), type: "text" }),
    });
    setText("");
    await loadMessages();
  }

  async function sendText(e: React.FormEvent) {
    e.preventDefault();
    await sendCurrentMessage();
  }

  function applyFormat(prefix: string, suffix = prefix) {
    const element = composerRef.current;
    if (!element) return;
    const start = element.selectionStart ?? text.length;
    const end = element.selectionEnd ?? text.length;
    const selected = text.slice(start, end);
    const wrapped = `${prefix}${selected || "text"}${suffix}`;
    const next = `${text.slice(0, start)}${wrapped}${text.slice(end)}`;
    setText(next);
    requestAnimationFrame(() => {
      element.focus();
      const cursor = selected ? start + wrapped.length : start + prefix.length + 4;
      element.setSelectionRange(cursor, cursor);
    });
  }

  async function onComposerKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const meta = e.ctrlKey || e.metaKey;
    if (meta && e.key.toLowerCase() === "b") {
      e.preventDefault();
      applyFormat("**");
      return;
    }
    if (meta && e.key.toLowerCase() === "i") {
      e.preventDefault();
      applyFormat("_");
      return;
    }
    if (meta && e.key.toLowerCase() === "e") {
      e.preventDefault();
      applyFormat("`");
      return;
    }
    if (e.key === "Enter" && (meta || !e.shiftKey)) {
      e.preventDefault();
      await sendCurrentMessage();
    }
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
    <AppShell title="Chat">
      <div className="mx-auto flex h-[calc(100dvh-10rem)] max-w-4xl flex-col gap-3 md:h-[calc(100dvh-8rem)]">
        <Card className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Self Chat</p>
              <p className="text-xs text-[var(--muted)]">Private conversation with yourself</p>
            </div>
            <Input
              placeholder="Search in chat..."
              className="max-w-56"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </Card>

        <Card className="flex-1 space-y-2 overflow-y-auto bg-[var(--panel-2)] p-3 md:p-4">
          {!filtered.length ? (
            <p className="py-12 text-center text-sm text-[var(--muted)]">No messages yet. Start your first note-to-self.</p>
          ) : null}
          {filtered.map((message, index) => {
            const isSelf = message.type === "text" ? index % 2 === 0 : true;
            return (
              <article key={message.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-[var(--shadow-sm)] transition-all duration-200 md:max-w-[70%] ${
                    isSelf ? "bg-[var(--bubble-self)]" : "bg-[var(--bubble-other)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.file_url ? (
                    <a className="mt-1 block text-xs text-blue-600 underline" href={message.file_url} target="_blank" rel="noreferrer">
                      Open attachment
                    </a>
                  ) : null}
                  <p className="mt-1 text-right text-[11px] text-[var(--muted)]">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </article>
            );
          })}
        </Card>

        <form onSubmit={sendText} className="card safe-bottom sticky bottom-16 space-y-2 p-2 md:bottom-0">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" className="h-8 px-2" onClick={() => applyFormat("**")} aria-label="Bold (Ctrl+B)">
              <Bold size={14} />
            </Button>
            <Button type="button" variant="ghost" className="h-8 px-2" onClick={() => applyFormat("_")} aria-label="Italic (Ctrl+I)">
              <Italic size={14} />
            </Button>
            <Button type="button" variant="ghost" className="h-8 px-2" onClick={() => applyFormat("`")} aria-label="Code (Ctrl+E)">
              <Code2 size={14} />
            </Button>
            <p className="text-[11px] text-[var(--muted)]">Enter send, Shift+Enter newline, Ctrl/Cmd+Enter send</p>
          </div>
          <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <span className="sr-only">Attach file</span>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--panel-2)] transition-transform duration-200 hover:scale-105">
              <Paperclip size={16} />
            </span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(file);
              }}
            />
          </label>
          <textarea
            ref={composerRef}
            className="focus-ring min-h-10 flex-1 resize-y rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm"
            placeholder={uploading ? "Uploading file..." : "Type a message"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => void onComposerKeyDown(e)}
          />
          <Button type="submit" className="h-10 rounded-full px-4">
            <span className="flex items-center gap-1">
              Send <SendHorizontal size={14} />
            </span>
          </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
