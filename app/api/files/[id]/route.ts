import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase";
import { requireApiAuth } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

const renameSchema = z.object({
  file_name: z.string().min(1).max(160),
});

function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "_").trim();
}

function buildRenamedPath(path: string, nextName: string) {
  const slash = path.lastIndexOf("/");
  const folder = slash >= 0 ? path.slice(0, slash) : "";
  const filePart = slash >= 0 ? path.slice(slash + 1) : path;
  const dash = filePart.indexOf("-");
  const prefix = dash >= 0 ? filePart.slice(0, dash) : "file";
  return `${folder}/${prefix}-${nextName}`;
}

export async function PATCH(request: Request, { params }: Params) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const parsed = renameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data: file, error: findError } = await supabase.from("files").select("*").eq("id", id).single();
  if (findError || !file) {
    return NextResponse.json({ error: findError?.message || "File not found" }, { status: 404 });
  }

  const sanitizedName = sanitizeFileName(parsed.data.file_name);
  if (!sanitizedName) {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  const nextPath = buildRenamedPath(file.path, sanitizedName);
  if (nextPath !== file.path) {
    const { error: moveError } = await supabase.storage.from("files").move(file.path, nextPath);
    if (moveError) {
      return NextResponse.json({ error: moveError.message }, { status: 500 });
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("files")
    .update({ file_name: sanitizedName, path: nextPath })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: signed } = await supabase.storage.from("files").createSignedUrl(updated.path, 60 * 60);
  return NextResponse.json({ ...updated, file_url: signed?.signedUrl ?? null });
}

export async function DELETE(_request: Request, { params }: Params) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data: file, error: findError } = await supabase.from("files").select("*").eq("id", id).single();
  if (findError || !file) {
    return NextResponse.json({ error: findError?.message || "File not found" }, { status: 404 });
  }

  const { error: storageDeleteError } = await supabase.storage.from("files").remove([file.path]);
  if (storageDeleteError) {
    return NextResponse.json({ error: storageDeleteError.message }, { status: 500 });
  }

  const { error: dbDeleteError } = await supabase.from("files").delete().eq("id", id);
  if (dbDeleteError) {
    return NextResponse.json({ error: dbDeleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
