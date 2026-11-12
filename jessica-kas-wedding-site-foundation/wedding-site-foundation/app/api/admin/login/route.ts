import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createToken } from "@/lib/rsvp-token";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || typeof password !== "string") return NextResponse.json({ error: "Admin access is not configured." }, { status: 503 });
    const a = Buffer.from(password), b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a,b)) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    const token = createToken({ type: "admin" }, 60 * 60 * 8);
    const response = NextResponse.json({ ok: true });
    response.cookies.set("wedding_admin", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 8 });
    return response;
  } catch { return NextResponse.json({ error: "Could not sign in." }, { status: 400 }); }
}