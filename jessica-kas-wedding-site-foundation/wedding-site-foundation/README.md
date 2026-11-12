# Jessica & Kas — Wedding Website Foundation

A responsive Next.js wedding website starter with eight pages and a server-verified RSVP flow.

## Included
- Home, Photos, Dress Code, Q&A, Travel, Things To Do, Registry, RSVP
- Mobile navigation and responsive layouts
- Papel Picado-inspired decorative styling and terracotta/ivory palette
- RSVP name lookup against a private Supabase guest list
- Household RSVP with attendance selection, dietary restrictions, and optional message
- Private server-side Supabase access and an Excel-friendly RSVP table

## Important: what is and is not live
The site UI and API routes are implemented, but the RSVP cannot accept real responses until you create a Supabase project, run `supabase/schema.sql`, add the environment variables, and populate the invited guest list. The guest database is not included in the public website bundle.

## Run locally
1. Install Node.js 20.9+.
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add your Supabase project URL and **service role key** to `.env.local`. Never commit `.env.local`.
5. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.
6. Add one row to `invitations` for each household/group, then add each invited person to `invited_guests` with the same `invitation_id`.
7. Run `npm run dev` and open http://localhost:3000.

## Deploy
Deploy the repository to Vercel and configure the same environment variables in Project Settings > Environment Variables. Add rate limiting or CAPTCHA to the RSVP lookup and admin login endpoints before public launch. Set a strong unique admin password and a random RSVP_SESSION_SECRET of at least 32 characters.

## Guest list and RSVP export
Manage invitees and responses in Supabase Table Editor. The `rsvp_submissions` table stores one response per invitation group as JSON, which can be exported from Supabase as CSV and opened in Excel. A private dashboard is included at `/admin`. It uses `ADMIN_PASSWORD` and a signed HTTP-only cookie. Export is CSV, which opens in Excel.

## Personalization still needed
- Confirm how the couple's names should be displayed.
- Add engagement photos.
- Finalize dress code, RSVP deadline, hotel recommendations, local activities, registry URLs, and contact details.
- Confirm whether every guest should be able to update an RSVP after submitting.
- Add a private admin dashboard if desired.

## Security notes
- The service-role key is server-only.
- Guest records and RSVP submissions have Row Level Security enabled and no public read/write policies.
- Lookup uses first and last name, case-insensitively. For stronger verification, consider adding an invitation access code or email/phone one-time verification, plus rate limiting/CAPTCHA.
- This starter uses one primary guest name to locate the household. If duplicate first/last-name combinations are possible, add a unique invitation code or another verification factor.
