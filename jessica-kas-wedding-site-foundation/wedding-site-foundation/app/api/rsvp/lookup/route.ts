import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createToken } from "@/lib/rsvp-token";

export async function POST(request: Request) {
  try {
    const { firstName, lastName } = await request.json();
    if (typeof firstName !== "string" || typeof lastName !== "string" || !firstName.trim() || !lastName.trim()) {
      return NextResponse.json({ error: "Enter both your first and last name." }, { status: 400 });
    }
    const db = supabaseAdmin();
    const { data: guest, error } = await db.from("invited_guests")
      .select("id, first_name, last_name, invitation_id, can_rsvp")
      .ilike("first_name", firstName.trim()).ilike("last_name", lastName.trim()).maybeSingle();
    if (error || !guest || !guest.can_rsvp) return NextResponse.json({ error: "We couldn’t find an invitation with that name. Please check the spelling or contact us." }, { status: 404 });
    const { data: guests, error: groupError } = await db.from("invited_guests")
      .select("id, first_name, last_name, can_rsvp")
      .eq("invitation_id", guest.invitation_id).order("created_at");
    if (groupError || !guests?.length) return NextResponse.json({ error: "We couldn’t load this invitation. Please contact us." }, { status: 500 });
    const accessToken = createToken({ type: "rsvp", invitationId: guest.invitation_id, guestIds: guests.map(g => g.id) });
    return NextResponse.json({
      access_token: accessToken,
      invitation_id: guest.invitation_id,
      primary_guest_id: guest.id,
      guests: guests.map(g => ({ ...g, is_primary: g.id === guest.id }))
    });

} catch (error) {
  console.error("RSVP LOOKUP ERROR:", error);

  return NextResponse.json(
    {
      error:
        "We couldn't process your RSVP lookup. Please try again later."
    },
    { status: 500 }
  );
}
