import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase";
import { requireApiAuth } from "@/lib/api-auth";

const schema = z.object({
  content: z.string().min(1),
  type: z.enum(["text", "file"]).default("text"),
  file_url: z.string().nullable().optional(),
  file_name: z.string().nullable().optional(),
  mime_type: z.string().nullable().optional(),
});

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("messages").insert(parsed.data).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
