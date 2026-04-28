import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { requireApiAuth } from "@/lib/api-auth";

function folderForMime(mime: string) {
  if (mime.startsWith("image/")) return "images";
  if (mime.includes("pdf") || mime.includes("document") || mime.includes("text")) return "documents";
  return "others";
}

async function ensureFilesBucket() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.storage.listBuckets();
  if (error) return { ok: false as const, error: error.message };
  const exists = (data ?? []).some((bucket) => bucket.name === "files");
  if (exists) return { ok: true as const };
  const { error: createError } = await supabase.storage.createBucket("files", {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
  });
  if (createError) return { ok: false as const, error: createError.message };
  return { ok: true as const };
}

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Limit is 10 MB." }, { status: 400 });
  }

  const folder = folderForMime(file.type || "");
  const path = `${folder}/${randomUUID()}-${file.name}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const bucketState = await ensureFilesBucket();
  if (!bucketState.ok) {
    return NextResponse.json({ error: `Storage setup failed: ${bucketState.error}` }, { status: 500 });
  }

  const supabase = createServerSupabaseClient();
  const { error: uploadError } = await supabase.storage.from("files").upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });

  const { data: signedData, error: signedError } = await supabase.storage.from("files").createSignedUrl(path, 60 * 60);
  if (signedError) return NextResponse.json({ error: signedError.message }, { status: 500 });

  const { data: meta, error: metaError } = await supabase
    .from("files")
    .insert({
      path,
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
    })
    .select("*")
    .single();
  if (metaError) return NextResponse.json({ error: metaError.message }, { status: 500 });

  return NextResponse.json({ ...meta, file_url: signedData.signedUrl });
}
