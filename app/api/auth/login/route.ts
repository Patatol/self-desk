import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get("password");

  if (typeof password !== "string" || password !== env.APP_PASSWORD) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  await createSession();
  return NextResponse.redirect(new URL("/chat", request.url));
}
