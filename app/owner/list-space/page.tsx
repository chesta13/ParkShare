"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ListSpacePage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
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
        <p className="form-intro">Start with the basics. Nothing is published until you choose to publish it.</p>

        {submitted ? (
          <div className="success-card" role="status">
            <div className="success-icon">✓</div>
            <h2>Listing draft saved.</h2>
            <p>This MVP form is ready for the database layer. Next we&apos;ll persist this information and add availability.</p>
            <div className="form-actions">
              <Link className="btn btn-primary" href="/owner">Back to dashboard</Link>
              <button className="btn" onClick={() => setSubmitted(false)}>Edit draft</button>
            </div>
          </div>
        ) : (
          <form className="listing-form" onSubmit={handleSubmit}>
            <fieldset>
              <legend>Location</legend>
              <div className="form-grid">
                <label>Area / locality<input required name="locality" placeholder="e.g. Connaught Place" /></label>
                <label>City<input required name="city" placeholder="e.g. New Delhi" /></label>
                <label className="full">Address or access description<textarea required name="address" rows={3} placeholder="Describe where the driver should find the entrance. Avoid unnecessary private details." /></label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Space details</legend>
              <div className="form-grid">
                <label>Listing title<input required name="title" placeholder="e.g. Covered parking near CP" /></label>
                <label>Vehicle type<select name="vehicleType" defaultValue="car"><option value="car">Car</option><option value="suv">SUV</option><option value="bike">Motorcycle</option><option value="any">Any vehicle</option></select></label>
                <label className="full">Description<textarea name="description" rows={4} placeholder="Covered/open, access hours, size, landmarks, restrictions..." /></label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Pricing</legend>
              <div className="form-grid">
                <label>Hourly price (₹)<input required name="hourlyRate" type="number" min="1" step="1" placeholder="40" /></label>
              </div>
            </fieldset>

            <div className="form-actions">
              <Link className="btn" href="/owner">Cancel</Link>
              <button className="btn btn-primary" type="submit">Save listing draft →</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
