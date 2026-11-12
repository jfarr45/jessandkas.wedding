"use client";
import { useState } from "react";
import { PageIntro } from "@/components/page-intro";

type Guest = { id: string; first_name: string; last_name: string };
type Submission = { id: string; invitation_id: string; submitted_at: string; responses: {guestId:string;attending:boolean}[]; dietary_restrictions: string; message: string };
type Data = { submissions: Submission[]; invitations: {id:string;household_label:string}[]; guests: Guest[] };
export default function AdminPage() {
  const [password,setPassword] = useState("");
  const [data,setData] = useState<Data|null>(null);
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  async function signIn(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const login = await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
      const result = await login.json(); if(!login.ok) throw new Error(result.error);
      const res = await fetch("/api/admin/data"); const d = await res.json(); if(!res.ok) throw new Error(d.error);
      setData(d); setPassword("");
    } catch(err) { setError(err instanceof Error ? err.message : "Unable to sign in."); }
    finally { setBusy(false); }
  }
  function exportCsv() {
    if(!data) return;
    const rows = [["Household","Guest responses","Dietary restrictions","Message","Submitted"]];
    for(const sub of data.submissions) {
      const invitation = data.invitations.find(i=>i.id===sub.invitation_id);
      const guestNames = (sub.responses||[]).map(r=>{
        const g=data.guests.find(g=>g.id===r.guestId);
        return g ? `${g.first_name} ${g.last_name}: ${r.attending?"Attending":"Declined"}` : "";
      }).filter(Boolean).join("; ");
      rows.push([invitation?.household_label||"Invitation",guestNames,sub.dietary_restrictions||"",sub.message||"",sub.submitted_at||""]);
    }
    const csv=rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="wedding-rsvps.csv";a.click();URL.revokeObjectURL(url);
  }
  return <div className="content-page rsvp-page"><PageIntro eyebrow="PRIVATE AREA" title="RSVP Dashboard">For the couple only. Sign in to review responses and export them for Excel.</PageIntro>
    {!data ? <form className="rsvp-card" onSubmit={signIn}><label>Admin password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label><button className="button button-primary full-button" disabled={busy}>{busy?"Signing in...":"Sign in"}</button></form> :
    <section className="rsvp-card"><div className="admin-summary"><span className="eyebrow">RESPONSE SUMMARY</span><h2>{data.submissions.length} invitation groups responded</h2><p>{data.guests.length} invited guests across responded households.</p></div><button className="button button-primary full-button" onClick={exportCsv}>Export RSVPs for Excel</button>
      <div className="admin-list">{data.submissions.map(sub=>{const inv=data.invitations.find(i=>i.id===sub.invitation_id);return <article className="admin-row" key={sub.id}><strong>{inv?.household_label||"Invitation"}</strong><small>{new Date(sub.submitted_at).toLocaleString()}</small><p>{(sub.responses||[]).map(r=>{const g=data.guests.find(g=>g.id===r.guestId);return `${g?g.first_name+" "+g.last_name:"Guest"} — ${r.attending?"Attending":"Declined"}`;}).join(" · ")}</p>{sub.dietary_restrictions&&<p><b>Dietary:</b> {sub.dietary_restrictions}</p>}{sub.message&&<p><b>Message:</b> {sub.message}</p>}</article>;})}</div>
    </section>}
    {error&&<p className="form-message error">{error}</p>}
  </div>;
}
