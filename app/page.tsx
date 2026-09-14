const spaces = [
  { title: "Covered parking near Connaught Place", area: "Barakhamba Road · 0.6 km away", price: "₹60/hr", rating: "4.9 ★" },
  { title: "Secure driveway parking", area: "Khan Market · 1.1 km away", price: "₹45/hr", rating: "4.8 ★" },
  { title: "Easy-access basement spot", area: "Karol Bagh · 0.8 km away", price: "₹35/hr", rating: "4.7 ★" },
];

export default function Home() {
  return (
    <main>
      <header className="container nav">
        <div className="logo">Park<span>Share</span></div>
        <div className="nav-actions">
          <button className="btn">List your space</button>
          <button className="btn btn-primary">Sign in</button>
        </div>
      </header>

      <section className="container hero">
        <h1>Park closer.<br />Share smarter.</h1>
        <p>Find a private parking space when you need one — and earn from yours when you don't.</p>

        <form className="search-card">
          <div className="field">
            <label>Where</label>
            <input placeholder="Destination or locality" aria-label="Destination" />
          </div>
          <div className="field">
            <label>Start</label>
            <input type="datetime-local" aria-label="Start time" />
          </div>
          <div className="field">
            <label>End</label>
            <input type="datetime-local" aria-label="End time" />
          </div>
          <button className="btn btn-primary" type="submit">Find parking</button>
        </form>
      </section>

      <section className="container section">
        <h2>Popular spaces</h2>
        <p className="section-intro">A first look at the marketplace we are building.</p>
        <div className="cards">
          {spaces.map((space) => (
            <article className="card" key={space.title}>
              <div className="space-image" aria-hidden="true">🚗</div>
              <div className="card-body">
                <div className="card-top">
                  <div>
                    <h3>{space.title}</h3>
                    <div className="meta">{space.area}</div>
                  </div>
                  <div className="price">{space.price}</div>
                </div>
                <div className="rating">{space.rating} · Verified listing</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2>How ParkShare works</h2>
        <p className="section-intro">Two sides of the marketplace. One simple transaction.</p>
        <div className="how">
          <article className="step"><div className="step-number">01 · OWNER</div><h3>List an idle space</h3><p>Set your location, availability and hourly price. You stay in control of when the space can be booked.</p></article>
          <article className="step"><div className="step-number">02 · DRIVER</div><h3>Find & reserve</h3><p>Search around your destination, compare spaces and book a spot for exactly the time you need.</p></article>
          <article className="step"><div className="step-number">03 · PLATFORM</div><h3>We handle the transaction</h3><p>Availability, payment, booking status and reviews create the trust layer between strangers.</p></article>
        </div>
      </section>

      <footer className="container footer">ParkShare · Marketplace MVP · Built to turn idle parking into useful capacity.</footer>
    </main>
  );
}
