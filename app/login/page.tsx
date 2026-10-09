"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setHydrated(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "Sign in failed. Please try again.");
        return;
      }
      router.push("/owner");
      router.refresh();
    } catch {
      setError("Could not reach ParkShare. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <header className="container nav"><Link className="logo" href="/">Park<span>Share</span></Link><Link className="btn" href="/register">Create account</Link></header>
      <section className="container form-shell">
        <div className="eyebrow">WELCOME BACK</div>
        <h1>Sign in to ParkShare.</h1>
        <p className="form-intro">Manage your parking listings and bookings from one place.</p>
        <form className="listing-form" onSubmit={handleSubmit}>
          <fieldset><legend>Your account</legend><div className="form-grid">
            <label className="full">Email<input required type="email" name="email" autoComplete="email" maxLength={254} /></label>
            <label className="full">Password<input required type="password" name="password" autoComplete="current-password" maxLength={128} /></label>
          </div></fieldset>
          {error && <div className="error-card" role="alert">{error}</div>}
          <div className="form-actions"><Link className="btn" href="/">Cancel</Link><button className="btn btn-primary" type="submit" disabled={!hydrated || saving}>{saving ? "Signing in…" : "Sign in"}</button></div>
        </form>
        <p className="form-intro">New to ParkShare? <Link href="/register">Create an account</Link>.</p>
      </section>
    </main>
  );
}
