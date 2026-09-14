import Link from "next/link";

const checklist = [
  ["Location", "Tell drivers where the space is."],
  ["Pricing", "Choose your hourly earning."],
  ["Availability", "Decide when drivers can book."],
  ["Details", "Describe the space and vehicle fit."],
];

export default function OwnerPage() {
  return (
    <main className="owner-page">
      <header className="container nav">
        <Link className="logo" href="/">Park<span>Share</span></Link>
        <Link className="btn" href="/">← Back to search</Link>
      </header>

      <section className="container owner-hero">
        <div>
          <div className="eyebrow">OWNER MODE</div>
          <h1>Turn an empty<br />parking space into income.</h1>
          <p>List your space, choose when it is available, and let drivers book it by the hour.</p>
        </div>
        <div className="owner-card">
          <div className="owner-card-label">YOUR LISTING</div>
          <h2>Let&apos;s set it up.</h2>
          <p>You can edit every detail before publishing.</p>
          <Link className="btn btn-primary btn-large" href="/owner/list-space">List my space →</Link>
        </div>
      </section>

      <section className="container section">
        <h2>What you&apos;ll configure</h2>
        <div className="how owner-checklist">
          {checklist.map(([title, description], index) => (
            <article className="step" key={title}>
              <div className="step-number">0{index + 1}</div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
