"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function GuestFeedbackForm({ slug }) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    setError(false);
    try {
      const response = await fetch("/api/public/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, rating, name, message }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(true);
        setStatus(result.error || "Could not submit feedback.");
        return;
      }
      setStatus("Thanks for sharing your feedback.");
      setMessage("");
      setName("");
    } catch {
      setError(true);
      setStatus("Could not send your feedback. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset>
        <legend className="text-sm font-semibold text-slate-800">Your rating</legend>
        <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Rate your visit">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} ${value === 1 ? "star" : "stars"}`} onClick={() => setRating(value)} className="grid size-10 place-items-center rounded-lg transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <Star size={22} className={value <= rating ? "fill-amber-400 text-amber-500" : "text-slate-300"} aria-hidden="true" />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-slate-600">{rating}/5</span>
        </div>
      </fieldset>

      <label className="block text-sm font-semibold text-slate-800">Name <span className="font-normal text-slate-400">(optional)</span>
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-base font-normal outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-900/10" placeholder="How should we address you?" />
      </label>

      <label className="block text-sm font-semibold text-slate-800">Your feedback
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} required minLength={4} maxLength={1000} rows={4} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 p-3 text-base font-normal outline-none placeholder:text-slate-400 focus:border-blue-800 focus:ring-4 focus:ring-blue-900/10" placeholder="What did you like? What could be better?" />
      </label>

      {status && <p role={error ? "alert" : "status"} className={`rounded-lg p-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{status}</p>}
      <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-blue-950 px-4 text-sm font-bold text-white transition hover:bg-blue-900 disabled:cursor-wait disabled:opacity-60">{busy ? "Sending feedback…" : "Send feedback"}</button>
      <p className="text-center text-xs text-slate-400">Your feedback goes directly to the shop.</p>
    </form>
  );
}
