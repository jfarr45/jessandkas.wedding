import { PageIntro } from "@/components/page-intro";
const captions = ["A favorite moment", "The little things", "A day to remember", "Together"];
export default function PhotosPage() {
  return <div className="content-page"><PageIntro eyebrow="A FEW FAVORITE MOMENTS" title="Photos">A little glimpse into our story. We’ll add more photos here as the big day gets closer.</PageIntro><div className="photo-grid">{captions.map((caption, i) => <div className={`photo-placeholder photo-${i+1}`} key={caption}><span>PHOTO {String(i+1).padStart(2,"0")}</span><p>{caption}</p></div>)}</div><p className="small-note">Replace these placeholders with your engagement and wedding photos.</p></div>;
}