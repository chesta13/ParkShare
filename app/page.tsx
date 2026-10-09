"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Space = {
  id: string;
  title: string;
  description: string | null;
  locality: string;
  city: string;
  vehicleTypes: string[];
  hourlyRate: number;
  currency: string;
  owner: { name: string | null };
};

export default function Home() {
  const [spaces, setSpaces] = useState<Space[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingWindow, setBookingWindow] = useState<{ startAt: string; endAt: string } | null>(null);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const locality = String(form.get("destination") ?? "").trim();
    const startValue = String(form.get("startAt") ?? "");
    const endValue = String(form.get("endAt") ?? "");
    if (Boolean(startValue) !== Boolean(endValue)) {
      setError("Choose both a start and end time, or leave both empty.");
      setLoading(false);
      return;
    }
    const startDate = startValue ? new Date(startValue) : null;
    const endDate = endValue ? new Date(endValue) : null;
    if (startValue && endValue && (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate >= endDate)) {
      setError("Choose valid times and make sure end time is later than start time.");
      setLoading(false);
      return;
    }
    setBookingWindow(startDate && endDate ? { startAt: startDate.toISOString(), endAt: endDate.toISOString() } : null);
    setBookingMessage("");

    const params = new URLSearchParams();
    if (locality) params.set("locality", locality);
    if (startValue && endValue) {
      params.set("startAt", new Date(startValue).toISOString());
      params.set("endAt", new Date(endValue).toISOString());
    }
    try {
      const response = await fetch(`/api/spaces?${params.toString()}`, { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Parking search failed.");
      setSpaces(Array.isArray(result.spaces) ? result.spaces : []);
    } catch (caught) {
      setSpaces([]);
      setError(caught instanceof Error ? caught.message : "Parking search is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function bookSpace(spaceId: string) {
    if (!bookingWindow) {
      setError("Choose a start and end time before booking.");
      return;
    }
    setError("");
    setBookingMessage("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceId, ...bookingWindow }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Booking could not be created.");
      setBookingMessage(typeof result.message === "string" ? result.message : "Booking hold created.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Booking could not be created.");
    }
  }

  return (
    <main>
      <header className="container nav">
        <Link className="logo" href="/">Park<span>Share</span></Link>
        <div className="nav-actions">
          <Link className="btn" href="/bookings">My bookings</Link>
          <Link className="btn" href="/owner">List your space</Link>
          <Link className="btn btn-primary" href="/login">Sign in</Link>
        </div>
      </header>

      <section className="container hero">
        <h1>Park closer.<br />Share smarter.</h1>
        <p>Find a private parking space when you need one — and earn from yours when you don&apos;t.</p>
        <form className="search-card" onSubmit={handleSearch}>
          <div className="field"><label htmlFor="destination">Where</label><input id="destination" name="destination" placeholder="Destination or locality" aria-label="Destination" /></div>
          <div className="field"><label htmlFor="startAt">Start</label><input id="startAt" name="startAt" type="datetime-local" aria-label="Start time" /></div>
          <div className="field"><label htmlFor="endAt">End</label><input id="endAt" name="endAt" type="datetime-local" aria-label="End time" /></div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Searching…" : "Find parking"}</button>
        </form>
        {error && <div className="error-card" role="alert">{error} {error.toLowerCase().includes("sign in") && <Link href="/login">Sign in</Link>}</div>}
        {bookingMessage && <div className="success-card" role="status">{bookingMessage}</div>}
      </section>

      <section className="container section">
        <h2>Parking spaces</h2>
        <p className="section-intro">Search returns active listings from ParkShare, filtered by locality and availability.</p>
        {spaces === null && <p className="section-intro">Enter a destination and optional time window above to find available spaces.</p>}
        {spaces !== null && !loading && !error && spaces.length === 0 && <p className="section-intro">No active spaces match that search yet. Try another locality or time.</p>}
        <div className="cards">
          {spaces?.map((space) => (
            <article className="card" key={space.id}>
              <div className="space-image" aria-hidden="true">🚗</div>
              <div className="card-body">
                <div className="card-top"><div><h3>{space.title}</h3><div className="meta">{space.locality} · {space.city}</div></div><div className="price">₹{space.hourlyRate}/hr</div></div>
                {space.description && <p className="meta">{space.description}</p>}
                <div className="meta">Vehicle: {space.vehicleTypes.join(", ")}</div>
                {bookingWindow ? <button className="btn btn-primary" onClick={() => void bookSpace(space.id)}>Hold this space for 10 minutes</button> : <p className="meta">Choose a start and end time above to book this space.</p>}
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
          <article className="step"><div className="step-number">03 · PLATFORM</div><h3>Trust comes first</h3><p>Availability and clear listing details are the first step toward reliable bookings between owners and drivers.</p></article>
        </div>
      </section>

      <footer className="container footer">ParkShare · Marketplace MVP · Built to turn idle parking into useful capacity.</footer>
    </main>
  );
}
