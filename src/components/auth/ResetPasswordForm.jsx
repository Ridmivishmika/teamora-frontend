"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/lib/api";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [state, setState] = useState({ loading: false, error: "", success: "" });
  const submit = async (event) => {
    event.preventDefault();
    if (!token) return setState({ loading: false, error: "This reset link is invalid or incomplete.", success: "" });
    if (password.length < 6) return setState({ loading: false, error: "Password must be at least 6 characters.", success: "" });
    if (password !== confirmation) return setState({ loading: false, error: "Passwords do not match.", success: "" });
    setState({ loading: true, error: "", success: "" });
    try { await resetPassword(token, password); setState({ loading: false, error: "", success: "Password updated. Redirecting to sign in..." }); setTimeout(() => router.replace("/login"), 1200); }
    catch (error) { setState({ loading: false, error: error.message || "Unable to reset password", success: "" }); }
  };
  return <form onSubmit={submit} className="space-y-5">
    {state.error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</div>}
    {state.success && <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{state.success}</div>}
    <div><label className="mb-1 block text-sm font-medium text-gray-700">New password</label><input type="password" required minLength="6" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500" /></div>
    <div><label className="mb-1 block text-sm font-medium text-gray-700">Confirm new password</label><input type="password" required minLength="6" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500" /></div>
    <button disabled={state.loading} className="w-full rounded-md bg-orange-600 py-2.5 font-medium text-white transition hover:bg-orange-700 disabled:opacity-60">{state.loading ? "Updating..." : "Update password"}</button>
    <p className="text-center text-sm text-gray-600"><Link href="/forgot-password" className="font-medium text-orange-700 hover:underline">Request a new reset link</Link></p>
  </form>;
}
