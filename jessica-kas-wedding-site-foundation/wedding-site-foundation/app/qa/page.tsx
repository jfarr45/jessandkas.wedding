import { PageIntro } from "@/components/page-intro";
const questions = [
  ["When should I RSVP?", "Please RSVP by the date listed on your invitation. We’ll add the deadline here once it is finalized."],
  ["Can I bring a guest?", "Your invitation will show the guests included in your party. Please contact us if you have questions."],
  ["Are children invited?", "Please refer to the names listed on your invitation for the guests included in your party."],
  ["What should I do about dietary restrictions?", "Please include any dietary needs when submitting your RSVP so we can plan accordingly."],
  ["Where is the wedding?", "The celebration will take place at 2723 Twp Rd 71, Haviland, OH 45851."],
  ["Who should I contact with questions?", "Please reach out to us directly. We’ll add contact details here."]
];
export default function QAPage() {
  return <div className="content-page"><PageIntro eyebrow="GOOD TO KNOW" title="Questions & Answers">A few helpful details to make planning easier.</PageIntro><div className="qa-list">{questions.map(([q,a])=><details className="qa-item" key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></div>;
}