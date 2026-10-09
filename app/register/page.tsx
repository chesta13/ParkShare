"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function RegisterPage() {
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          role: form.get("role"),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "Account creation failed. Please try again.");
        return;
      }
      router.push(form.get("role") === "DRIVER" ? "/" : "/owner");
      router.refresh();
    } catch {
      setError("Could not reach ParkShare. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <header className="container nav"><Link className="logo" href="/">Park<span>Share</span></Link><Link className="btn" href="/login">Sign in</Link></header>
      <section className="container form-shell">
        <div className="eyebrow">GET STARTED</div>
        <h1>Create your ParkShare account.</h1>
        <p className="form-intro">Choose how you want to use the parking marketplace. You can start as a driver, an owner, or both.</p>
        <form className="listing-form" onSubmit={handleSubmit}>
          <fieldset><legend>Account details</legend><div className="form-grid">
            <label className="full">Name<input name="name" autoComplete="name" maxLength={100} /></label>
            <label className="full">Email<input required type="email" name="email" autoComplete="email" maxLength={254} /></label>
            <label className="full">Password (12 characters minimum)<input required type="password" name="password" autoComplete="new-password" minLength={12} maxLength={128} /></label>
            <label className="full">I want to<select name="role" defaultValue="BOTH"><option value="DRIVER">Find parking (driver)</option><option value="OWNER">List my parking space (owner)</option><option value="BOTH">Find parking and list a space</option></select></label>
          </div></fieldset>
          {error && <div className="error-card" role="alert">{error}</div>}
          <div className="form-actions"><Link className="btn" href="/">Cancel</Link><button className="btn btn-primary" type="submit" disabled={!hydrated || saving}>{saving ? "Creating account…" : "Create account"}</button></div>
        </form>
        <p className="form-intro">Already have an account? <Link href="/login">Sign in</Link>.</p>
      </section>
    </main>
  );
}
