"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Booking = {
  id: string;
  startAt: string;
  endAt: string;
  totalMinor: number;
  currency: string;
  status: string;
  paymentStatus: string;
  holdExpiresAt: string | null;
  space: { title: string; locality: string; city: string };
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/bookings", { cache: "no-store" })
      .then(async (response) => ({ response, result: await response.json().catch(() => ({})) }))
      .then(({ response, result }) => {
        if (cancelled) return;
        if (response.status === 401) setSignedOut(true);
        else if (!response.ok) setError(typeof result.error === "string" ? result.error : "Bookings are unavailable.");
        else setBookings(Array.isArray(result.bookings) ? result.bookings : []);
      })
      .catch(() => { if (!cancelled) setError("Bookings are temporarily unavailable."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function cancelBooking(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(id)}/cancel`, { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (response.status === 410 && result.status === "EXPIRED") {
        setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status: "EXPIRED" } : booking));
        return;
      }
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Could not cancel the booking.");
      setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status: "CANCELLED" } : booking));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not cancel the booking.");
    }
  }

  return (
    <main>
      <header className="container nav"><Link className="logo" href="/">Park<span>Share</span></Link><div className="nav-actions"><Link className="btn" href="/">Find parking</Link><Link className="btn" href="/owner">Owner dashboard</Link></div></header>
      <section className="container form-shell">
        <div className="eyebrow">DRIVER MODE</div>
        <h1>My bookings</h1>
        <p className="form-intro">Review your booking holds and their current status.</p>
        {loading && <p className="section-intro">Loading bookings…</p>}
        {signedOut && <div className="section-intro">Sign in to see your bookings. <Link href="/login">Sign in</Link> or <Link href="/register">create an account</Link>.</div>}
        {error && <div className="error-card" role="alert">{error}</div>}
        {!loading && !signedOut && !error && bookings.length === 0 && <p className="section-intro">No bookings yet. Search for a space to get started.</p>}
        <div className="cards">
          {bookings.map((booking) => (
            <article className="card" key={booking.id}>
              <div className="card-body">
                <h2>{booking.space.title}</h2>
                <p className="meta">{booking.space.locality}, {booking.space.city}</p>
                <p>From: {new Date(booking.startAt).toLocaleString()}</p>
                <p>Until: {new Date(booking.endAt).toLocaleString()}</p>
                <p><strong>Total:</strong> ₹{(booking.totalMinor / 100).toFixed(2)}</p>
                <p className="meta">Status: {booking.status} · Payment: {booking.paymentStatus}</p>
                {booking.status === "PENDING_PAYMENT" && booking.holdExpiresAt && <p className="meta">Hold expires: {new Date(booking.holdExpiresAt).toLocaleString()}</p>}
                {booking.status === "EXPIRED" && <p className="meta">This hold expired and the space is available again.</p>}
                {booking.status === "PENDING_PAYMENT" && <button className="btn" onClick={() => void cancelBooking(booking.id)}>Cancel hold</button>}
              </div>
            </article>
          ))}
        </div>
        <p className="form-intro">Payments are not enabled yet. Booking holds do not charge money and expire after 10 minutes.</p>
      </section>
    </main>
  );
}
