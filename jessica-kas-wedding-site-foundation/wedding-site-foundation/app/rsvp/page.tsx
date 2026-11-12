 "use client";
import { useState } from "react";
import { PageIntro } from "@/components/page-intro";

type Guest = { id: string; first_name: string; last_name: string; is_primary: boolean; can_rsvp: boolean };
type LookupResult = { invitation_id: string; guests: Guest[]; primary_guest_id: string; access_token: string };

export default function RSVPPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [attendance, setAttendance] = useState<"yes"|"no">("yes");
  const [dietary, setDietary] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function findInvitation(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setSuccess(""); setLookup(null);
    try {
      const res = await fetch("/api/rsvp/lookup", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ firstName, lastName }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "We couldn’t find that invitation. Check the spelling or contact us.");
      setLookup(data);
      setSelected(Object.fromEntries(data.guests.map((g: Guest) => [g.id, true])));
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  async function submitRSVP(e: React.FormEvent) {
    e.preventDefault(); if (!lookup) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/rsvp/submit", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({
        invitationId: lookup.invitation_id, primaryGuestId: lookup.primary_guest_id, accessToken: lookup.access_token,
        responses: lookup.guests.map(g => ({ guestId: g.id, attending: attendance === "yes" && !!selected[g.id] })),
        dietaryRestrictions: dietary, message
      })});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Your response could not be saved.");
      setSuccess("Thank you! Your RSVP has been received.");
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  return <div className="content-page rsvp-page">
    <PageIntro eyebrow="WE HOPE YOU CAN JOIN US" title="Kindly RSVP">Please enter your name as it appears on your invitation to find your party.</PageIntro>
    {!lookup && <form className="rsvp-card" onSubmit={findInvitation}>
      <label>First name<input required autoComplete="given-name" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name"/></label>
      <label>Last name<input required autoComplete="family-name" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name"/></label>
      <button className="button button-primary full-button" disabled={busy}>{busy ? "Checking..." : "Find my invitation"}</button>
    </form>}
    {lookup && <form className="rsvp-card" onSubmit={submitRSVP}>
      <div className="matched-note"><span className="eyebrow">INVITATION FOUND</span><h2>Welcome, {firstName}!</h2><p>Please respond for everyone listed on your invitation.</p></div>
      <fieldset><legend>Will you be attending?</legend>
        <label className="choice"><input type="radio" name="attendance" checked={attendance==="yes"} onChange={()=>setAttendance("yes")}/> Joyfully accepts</label>
        <label className="choice"><input type="radio" name="attendance" checked={attendance==="no"} onChange={()=>setAttendance("no")}/> Regretfully declines</label>
      </fieldset>
      {attendance === "yes" && <fieldset><legend>Who is attending?</legend><p className="field-help">Only guests included in this invitation can be selected.</p>
        {lookup.guests.map(g=><label className="choice" key={g.id}><input type="checkbox" checked={!!selected[g.id]} onChange={e=>setSelected(s=>({...s,[g.id]:e.target.checked}))}/>{g.first_name} {g.last_name}</label>)}
      </fieldset>}
      {attendance === "yes" && <label>Dietary restrictions or allergies<textarea value={dietary} onChange={e=>setDietary(e.target.value)} placeholder="Please share any dietary needs..." rows={3}/></label>}
      <label>Message for the couple <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Optional note..." rows={3}/></label>
      <button className="button button-primary full-button" disabled={busy}>{busy ? "Submitting..." : "Submit RSVP"}</button>
      <button type="button" className="text-button" onClick={()=>{setLookup(null);setError("");setSuccess("");}}>This isn’t my invitation</button>
    </form>}
    {error && <p className="form-message error" role="alert">{error}</p>}
    {success && <p className="form-message success" role="status">{success}</p>}
    <p className="small-note">Having trouble finding your invitation? Please contact us directly.</p>
  </div>;
}