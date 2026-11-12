
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createToken } from "@/lib/rsvp-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // ============================================
    // STEP 1: Read and validate guest information
    // ============================================

    const body = await request.json();

    const { firstName, lastName } = body;

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      !firstName.trim() ||
      !lastName.trim()
    ) {
      return NextResponse.json(
        {
          error: "Please enter your first and last name.",
        },
        { status: 400 }
      );
    }

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    // ============================================
    // STEP 2: Connect to Supabase
    // ============================================

    const db = supabaseAdmin();

    // ============================================
    // STEP 3: Find invited guest
    // ============================================

    const { data: guest, error: guestError } = await db
      .from("invited_guests")
      .select(
        "id, first_name, last_name, invitation_id, can_rsvp"
      )
      .ilike("first_name", cleanFirstName)
      .ilike("last_name", cleanLastName)
      .maybeSingle();

    if (guestError) {
      console.error(
        "RSVP LOOKUP ERROR - Guest query:",
        guestError
      );

      return NextResponse.json(
        {
          error:
            "We couldn't verify your invitation right now. Please try again later.",
        },
        { status: 500 }
      );
    }

    if (!guest || !guest.can_rsvp) {
      return NextResponse.json(
        {
          error:
            "We couldn't find an invitation with that name. Please check the spelling or contact us.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // STEP 4: Retrieve household guests
    // ============================================

    const { data: guests, error: groupError } = await db
      .from("invited_guests")
      .select(
        "id, first_name, last_name, can_rsvp"
      )
      .eq("invitation_id", guest.invitation_id)
      .order("created_at", {
        ascending: true,
      });

    if (groupError) {
      console.error(
        "RSVP LOOKUP ERROR - Household query:",
        groupError
      );

      return NextResponse.json(
        {
          error:
            "We couldn't load your invitation details. Please try again later.",
        },
        { status: 500 }
      );
    }

    if (!guests || guests.length === 0) {
      return NextResponse.json(
        {
          error:
            "No guests were found for this invitation. Please contact us.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // STEP 5: Generate secure RSVP access token
    // ============================================

    const accessToken = createToken({
      type: "rsvp",
      invitationId: guest.invitation_id,
      guestIds: guests.map((g) => g.id),
    });

    // ============================================
    // STEP 6: Return verified invitation
    // ============================================

    return NextResponse.json({
      invitation_id: guest.invitation_id,

      primary_guest_id: guest.id,

      access_token: accessToken,

      guests: guests.map((g) => ({
        id: g.id,
        first_name: g.first_name,
        last_name: g.last_name,
        can_rsvp: g.can_rsvp,
        is_primary: g.id === guest.id,
      })),
    });

  } catch (error) {
    // ============================================
    // STEP 7: Log unexpected server errors
    // ============================================

    console.error(
      "RSVP LOOKUP ERROR - Unexpected failure:",
      error
    );

    return NextResponse.json(
      {
        error:
          "We couldn't process your RSVP lookup. Please try again later.",
      },
      { status: 500 }
    );
  }
}
