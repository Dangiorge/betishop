"use client";
import { useState } from "react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function GuestFeedbackForm({ slug }) {
  const [rating, setRating] = useState("5"); const [name, setName] = useState(""); const [message, setMessage] = useState(""); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setStatus("");
    const response = await fetch("/api/public/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, rating, name, message }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) { setStatus(result.error || "Could not submit feedback"); return; }
    setStatus("Thanks, your feedback has been sent."); setMessage(""); setName("");
  }
  return <form onSubmit={submit} className="mt-4 space-y-3">
    <label className="block text-sm font-medium">Rating<select className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5" value={rating} onChange={(e) => setRating(e.target.value)}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} {n === 1 ? "star" : "stars"}</option>)}</select></label>
    <Input placeholder="Name (optional)" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
    <label className="block text-sm font-medium">Your feedback<textarea className="mt-1 min-h-28 w-full rounded-lg border border-slate-200 p-3 text-sm" required minLength={4} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What went well? What could be better?" /></label>
    {status && <p role="status" className="text-sm text-slate-700">{status}</p>}
    <Button className="w-full" disabled={busy}>{busy ? "Sending…" : "Send feedback"}</Button>
  </form>;
}
