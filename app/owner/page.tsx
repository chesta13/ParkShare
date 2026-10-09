"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Space = {
  id: string;
  title: string;
  locality: string;
  city: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "BLOCKED";
  hourlyRate: number;
};

export default function OwnerPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadSpaces = useCallback(async () => {
    try {
      const response = await fetch("/api/spaces?mine=1", { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setSignedOut(true);
        setSpaces([]);
        return;
      }
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Could not load your listings.");
      setSignedOut(false);
      setSpaces(Array.isArray(result.spaces) ? result.spaces : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load your listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadSpaces(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadSpaces]);

  async function publishSpace(id: string) {
    setUpdatingId(id);
    setError("");
    try {
      const response = await fetch(`/api/spaces/${encodeURIComponent(id)}/publish`, { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Could not publish this listing.");
      await loadSpaces();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not publish this listing.");
    } finally {
      setUpdatingId("");
    }
  }

  async function pauseSpace(id: string) {
    setUpdatingId(id);
    setError("");
    try {
      const response = await fetch(`/api/spaces/${encodeURIComponent(id)}/pause`, { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Could not pause this listing.");
      await loadSpaces();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not pause this listing.");
    } finally {
      setUpdatingId("");
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSignedOut(true);
    setSpaces([]);
  }

  return (
    <main className="owner-page">
      <header className="container nav">
        <Link className="logo" href="/">Park<span>Share</span></Link>
        <div className="nav-actions">
          <Link className="btn" href="/">Back to search</Link>
          {signedOut ? <Link className="btn btn-primary" href="/login">Sign in</Link> : <button className="btn" onClick={signOut}>Sign out</button>}
        </div>
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
          <p>Create a draft, set your first availability window, then publish when you are ready.</p>
          <Link className="btn btn-primary btn-large" href={signedOut ? "/login" : "/owner/list-space"}>List my space →</Link>
          {signedOut && <p><Link href="/register">New here? Create an account</Link></p>}
        </div>
      </section>

      <section className="container section">
        <h2>Your parking listings</h2>
        {loading && <p className="section-intro">Loading your listings…</p>}
        {signedOut && <p className="section-intro">Sign in to view and manage your listings. <Link href="/register">Create an account</Link> if you are new to ParkShare.</p>}
        {error && <div className="error-card" role="alert">{error}</div>}
        {!loading && !signedOut && spaces.length === 0 && <p className="section-intro">No listings yet. Create your first draft to get started.</p>}
        <div className="cards">
          {spaces.map((space) => (
            <article className="card" key={space.id}>
              <div className="card-body">
                <div className="card-top"><div><h3>{space.title}</h3><div className="meta">{space.locality}, {space.city}</div></div><div className="price">₹{space.hourlyRate}/hr</div></div>
                <p className="meta">Status: {space.status}</p>
                {(space.status === "DRAFT" || space.status === "PAUSED") && <button className="btn btn-primary" disabled={updatingId === space.id} onClick={() => void publishSpace(space.id)}>{updatingId === space.id ? "Publishing…" : "Publish listing"}</button>}
                {space.status === "ACTIVE" && <><p className="meta">Visible in public parking search.</p><button className="btn" disabled={updatingId === space.id} onClick={() => void pauseSpace(space.id)}>{updatingId === space.id ? "Pausing…" : "Pause listing"}</button></>}
                {space.status === "BLOCKED" && <p className="meta">This listing is blocked from publication.</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2>What you can configure</h2>
        <div className="how owner-checklist">
          <article className="step"><div className="step-number">01</div><h3>Location</h3><p>Tell drivers where the space is and how to find the entrance.</p></article>
          <article className="step"><div className="step-number">02</div><h3>Availability</h3><p>Choose an initial time window that can be booked.</p></article>
          <article className="step"><div className="step-number">03</div><h3>Pricing</h3><p>Set the hourly price and publish when the details are ready.</p></article>
        </div>
      </section>
    </main>
  );
}
