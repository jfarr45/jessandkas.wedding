 "use client";
import Link from "next/link";
import { useState } from "react";

const links = [
  ["Home", "/"], ["Photos", "/photos"], ["Dress Code", "/dress-code"],
  ["Q&A", "/qa"], ["Travel", "/travel"], ["Things To Do", "/things-to-do"],
  ["Registry", "/registry"], ["RSVP", "/rsvp"]
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link className="brand" href="/" onClick={() => setOpen(false)}>
        <span className="brand-script">Jessica <i>&</i> Kas</span>
        <span className="brand-date">OCTOBER 9, 2027 · OHIO</span>
      </Link>
      <button className="menu-toggle" aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
        <span /><span /><span />
      </button>
      <nav className={open ? "navigation navigation-open" : "navigation"} aria-label="Main navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}