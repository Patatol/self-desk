import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ messages: [], notes: [], files: [] });

  const supabase = createServerSupabaseClient();
  const [{ data: messages, error: messagesError }, { data: notes, error: notesError }, { data: files, error: filesError }] =
    await Promise.all([
      supabase.from("messages").select("*").ilike("content", `%${q}%`).order("created_at", { ascending: false }).limit(20),
      supabase
        .from("notes")
        .select("*")
        .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
        .order("updated_at", { ascending: false })
        .limit(20),
      supabase.from("files").select("*").ilike("file_name", `%${q}%`).order("created_at", { ascending: false }).limit(20),
    ]);

  if (messagesError || notesError || filesError) {
    return NextResponse.json(
      { error: messagesError?.message || notesError?.message || filesError?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    messages: messages ?? [],
    notes: notes ?? [],
    files: files ?? [],
  });
}
