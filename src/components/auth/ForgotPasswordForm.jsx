"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState({ loading: false, error: "", message: "", resetUrl: "" });

  const submit = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: "", message: "", resetUrl: "" });
    try {
      const result = await requestPasswordReset(email);
      setState({ loading: false, error: "", message: result.message, resetUrl: result.resetUrl || "" });
    } catch (error) {
      setState({ loading: false, error: error.message || "Unable to request a password reset", message: "", resetUrl: "" });
    }
  };

  return <form onSubmit={submit} className="space-y-5">
    {state.error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</div>}
    {state.message && <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800"><p>{state.message}</p>{state.resetUrl && <Link href={state.resetUrl} className="mt-2 inline-block font-medium text-orange-700 hover:underline">Continue to reset password</Link>}</div>}
    <div><label className="mb-1 block text-sm font-medium text-gray-700">Email address</label><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@acme.com" className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500" /></div>
    <button disabled={state.loading} className="w-full rounded-md bg-orange-600 py-2.5 font-medium text-white transition hover:bg-orange-700 disabled:opacity-60">{state.loading ? "Sending..." : "Send reset link"}</button>
    <p className="text-center text-sm text-gray-600"><Link href="/login" className="font-medium text-orange-700 hover:underline">Back to sign in</Link></p>
  </form>;
}
