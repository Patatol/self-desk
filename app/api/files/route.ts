import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("files").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const filesWithUrls = await Promise.all(
    (data ?? []).map(async (file) => {
      const { data: signed } = await supabase.storage.from("files").createSignedUrl(file.path, 60 * 60);
      return {
        ...file,
        file_url: signed?.signedUrl ?? null,
      };
    }),
  );

  return NextResponse.json(filesWithUrls);
}

export async function DELETE(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as { ids?: string[] } | null;
  const ids = body?.ids ?? [];
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data: files, error: findError } = await supabase.from("files").select("id,path").in("id", ids);
  if (findError) return NextResponse.json({ error: findError.message }, { status: 500 });
  if (!files?.length) return NextResponse.json({ error: "No matching files found" }, { status: 404 });

  const paths = files.map((file) => file.path);
  const { error: storageDeleteError } = await supabase.storage.from("files").remove(paths);
  if (storageDeleteError) {
    return NextResponse.json({ error: storageDeleteError.message }, { status: 500 });
  }

  const { error: dbDeleteError } = await supabase.from("files").delete().in("id", ids);
  if (dbDeleteError) {
    return NextResponse.json({ error: dbDeleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: ids.length });
}
