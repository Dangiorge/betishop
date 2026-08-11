"use client";

import { useState } from "react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

export default function SignupPage() {
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: false,
  });

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: false });

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus({
        loading: false,
        error: data.error ?? "Something went wrong",
        success: false,
      });
      return;
    }
    setStatus({ loading: false, error: "", success: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm p-6">
        {status.success ? (
          <div className="text-center py-4">
            <h1 className="text-lg font-semibold text-slate-900 mb-2">
              Request submitted
            </h1>
            <p className="text-sm text-slate-500">
              We'll review your request and email you once your shop account is
              approved.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-slate-900 mb-1">
              Request a shop account
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              Tell us about your business
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                name="businessName"
                placeholder="Shop name"
                value={form.businessName}
                onChange={handleChange}
                required
              />
              <Input
                name="ownerName"
                placeholder="Your name"
                value={form.ownerName}
                onChange={handleChange}
                required
              />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              {status.error && (
                <p className="text-red-600 text-sm">{status.error}</p>
              )}
              <Button
                type="submit"
                disabled={status.loading}
                className="w-full">
                {status.loading ? "Submitting..." : "Request account"}
              </Button>
            </form>
            <p className="text-sm text-slate-500 mt-5 text-center">
              Already approved?{" "}
              <a
                href="/login"
                className="text-blue-900 font-medium hover:underline">
                Log in
              </a>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
