import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-paper">
          <span className="hero-kicker">TOGETHER WITH OUR FAMILIES</span>
          <div className="hero-ornament" aria-hidden="true">✿</div>
          <h1>Jessica <em>&</em> Kas</h1>
          <p className="hero-subtitle">ARE GETTING MARRIED</p>
          <div className="hero-rule"><span>✳</span></div>
          <p className="hero-date">OCTOBER 9, 2027</p>
          <p className="hero-place">Haviland, Ohio</p>
          <Link className="button button-primary" href="/rsvp">Kindly RSVP</Link>
        </div>
        <div className="hero-side-note">A DAY FULL OF LOVE, LAUGHTER & A LITTLE MAGIC</div>
      </section>
      <section className="welcome section-wrap">
        <span className="eyebrow">WE’RE SO GLAD YOU’RE HERE</span>
        <h2>Let’s celebrate together.</h2>
        <p>We’re so excited to bring our favorite people together. This is where you’ll find everything you need to know as we get ready for our big day. Take a look around, make your plans, and don’t forget to RSVP!</p>
        <div className="ornament-divider">✳　✿　✳</div>
        <div className="home-details">
          <div><span className="eyebrow">THE DATE</span><h3>Saturday</h3><p>October 9, 2027</p></div>
          <div><span className="eyebrow">THE PLACE</span><h3>Haviland, Ohio</h3><p>2723 Twp Rd 71<br/>Haviland, OH 45851</p></div>
          <div><span className="eyebrow">THE DETAILS</span><h3>All in one place</h3><p>Travel, attire, FAQs, and more.</p></div>
        </div>
      </section>
      <section className="terracotta-band">
        <p>GOOD FOOD · GOOD MUSIC · OUR FAVORITE PEOPLE</p>
        <h2>Save the date</h2>
        <span>10.09.2027</span>
      </section>
    </>
  );
}