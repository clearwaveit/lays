"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const next = searchParams.get("next") || "/admin";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Invalid username or password.");
      return;
    }

    window.location.href = next;
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f6f7fb] px-4 py-8 text-slate-950">
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-[420px] gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-600">
            Lay's Campaign Admin
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Admin Login</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter your username and password to manage campaign content.
          </p>
        </div>

        <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-md bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-xs leading-5 text-slate-500">
          Development default: username <strong>admin</strong>, password{" "}
          <strong>admin123</strong>. Change these with environment variables on the
          live server.
        </p>
      </form>
    </main>
  );
}
