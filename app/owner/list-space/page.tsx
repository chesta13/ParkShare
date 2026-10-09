"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ListSpacePage() {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const toIso = (value: FormDataEntryValue | null) => {
      if (typeof value !== "string" || !value) return "";
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? "" : date.toISOString();
    };
    const payload = {
      locality: String(form.get("locality") ?? "").trim(),
      city: String(form.get("city") ?? "").trim(),
      addressLine: String(form.get("address") ?? "").trim(),
      title: String(form.get("title") ?? "").trim(),
      vehicleType: String(form.get("vehicleType") ?? "car"),
      description: String(form.get("description") ?? "").trim(),
      hourlyRate: Number(form.get("hourlyRate")),
      availableFrom: toIso(form.get("availableFrom")),
      availableTo: toIso(form.get("availableTo")),
    };

    try {
      const response = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "The listing could not be saved. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Could not reach ParkShare. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <header className="container nav">
        <Link className="logo" href="/">Park<span>Share</span></Link>
        <Link className="btn" href="/owner">Owner dashboard</Link>
      </header>

      <section className="container form-shell">
        <div className="eyebrow">STEP 01 · CREATE LISTING</div>
        <h1>List your parking space.</h1>
        <p className="form-intro">Start with the basics. Your listing stays a draft until it is reviewed and published.</p>

        {submitted ? (
          <div className="success-card" role="status">
            <div className="success-icon">✓</div>
            <h2>Listing draft saved.</h2>
            <p>Your listing was saved to ParkShare. Availability and publishing controls are the next step.</p>
            <div className="form-actions">
              <Link className="btn btn-primary" href="/owner">Back to dashboard</Link>
              <button className="btn" onClick={() => setSubmitted(false)}>Create another</button>
            </div>
          </div>
        ) : (
          <form className="listing-form" onSubmit={handleSubmit}>
            <fieldset>
              <legend>Location</legend>
              <div className="form-grid">
                <label>Area / locality<input required name="locality" maxLength={120} placeholder="e.g. Connaught Place" /></label>
                <label>City<input required name="city" maxLength={120} placeholder="e.g. New Delhi" /></label>
                <label className="full">Address or access description<textarea required name="address" maxLength={500} rows={3} placeholder="Describe where the driver should find the entrance. Avoid unnecessary private details." /></label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Space details</legend>
              <div className="form-grid">
                <label>Listing title<input required name="title" maxLength={120} placeholder="e.g. Covered parking near CP" /></label>
                <label>Vehicle type<select name="vehicleType" defaultValue="car"><option value="car">Car</option><option value="suv">SUV</option><option value="bike">Motorcycle</option><option value="any">Any vehicle</option></select></label>
                <label className="full">Description<textarea name="description" maxLength={2000} rows={4} placeholder="Covered/open, access hours, size, landmarks, restrictions..." /></label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Initial availability window</legend>
              <p className="form-intro">Choose the first time window this space can be booked. You can add more windows later.</p>
              <div className="form-grid">
                <label>Available from<input required name="availableFrom" type="datetime-local" /></label>
                <label>Available until<input required name="availableTo" type="datetime-local" /></label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Pricing</legend>
              <div className="form-grid">
                <label>Hourly price (₹)<input required name="hourlyRate" type="number" min="1" max="100000" step="1" placeholder="40" /></label>
              </div>
            </fieldset>

            {error && <div className="error-card" role="alert">{error} {error.toLowerCase().includes("sign in") && <Link href="/login">Sign in</Link>}</div>}
            <div className="form-actions">
              <Link className="btn" href="/owner">Cancel</Link>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save listing draft →"}</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
