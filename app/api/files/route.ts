import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("files").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
