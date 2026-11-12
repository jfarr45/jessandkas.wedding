import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyToken } from "@/lib/rsvp-token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invitationId, primaryGuestId, responses, dietaryRestrictions, message, accessToken } = body;
    if (typeof invitationId !== "string" || typeof primaryGuestId !== "string" || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: "Your RSVP details are incomplete." }, { status: 400 });
    }
    if (responses.some((r: any) => typeof r.guestId !== "string" || typeof r.attending !== "boolean")) {
      return NextResponse.json({ error: "One or more guest responses are invalid." }, { status: 400 });
    }
  
const session = typeof accessToken === "string"
  ? verifyToken(accessToken, "rsvp")
  : null;

const guestIds: string[] =
  session && Array.isArray(session.guestIds)
    ? session.guestIds.filter(
        (id): id is string => typeof id === "string"
      )
    : [];

if (
  !session ||
  session.invitationId !== invitationId ||
  guestIds.length === 0 ||
  !guestIds.includes(primaryGuestId) ||
  responses.some(
    (r: { guestId: string; attending: boolean }) =>
      !guestIds.includes(r.guestId)
  )
) {
  return NextResponse.json(
    {
      error:
        "Your invitation session expired or could not be verified. Please look up your invitation again."
    },
    { status: 403 }
  );
}

    const db = supabaseAdmin();
    const { data: invited, error: invitedError } = await db.from("invited_guests")
      .select("id").eq("invitation_id", invitationId);
    if (invitedError || !invited?.length) return NextResponse.json({ error: "This invitation could not be verified." }, { status: 403 });
    const allowed = new Set(invited.map(g => g.id));
    if (!allowed.has(primaryGuestId) || responses.some((r: any) => !allowed.has(r.guestId))) {
      return NextResponse.json({ error: "The response includes a guest who is not on this invitation." }, { status: 403 });
    }
    const { error } = await db.from("rsvp_submissions").upsert({
      invitation_id: invitationId,
      submitted_by_guest_id: primaryGuestId,
      responses,
      dietary_restrictions: typeof dietaryRestrictions === "string" ? dietaryRestrictions.slice(0, 2000) : "",
      message: typeof message === "string" ? message.slice(0, 2000) : "",
      submitted_at: new Date().toISOString()
    }, { onConflict: "invitation_id" });
    if (error) return NextResponse.json({ error: "We couldn’t save your response. Please try again." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "RSVP service is not configured yet. Please try again later." }, { status: 503 });
  }
}
