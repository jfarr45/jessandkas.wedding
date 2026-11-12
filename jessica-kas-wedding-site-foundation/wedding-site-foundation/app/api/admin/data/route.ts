import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/rsvp-token";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("wedding_admin")?.value;
  if (!token || !verifyToken(token, "admin")) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const db = supabaseAdmin();
    const { data: submissions, error } = await db.from("rsvp_submissions").select("*").order("submitted_at", { ascending: false });
    if (error) throw error;
    const ids = (submissions || []).map(s => s.invitation_id);
    const { data: invites } = ids.length ? await db.from("invitations").select("id, household_label").in("id", ids) : { data: [] as any[] };
    const { data: guests } = ids.length ? await db.from("invited_guests").select("id, invitation_id, first_name, last_name").in("invitation_id", ids) : { data: [] as any[] };
    return NextResponse.json({ submissions: submissions || [], invitations: invites || [], guests: guests || [] });
  } catch { return NextResponse.json({ error: "Could not load RSVP data." }, { status: 500 }); }
}