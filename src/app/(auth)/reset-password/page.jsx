import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10"><section className="w-full max-w-md border border-gray-200 bg-white p-7 shadow-sm"><p className="text-sm font-semibold tracking-wide text-orange-700">TEAMORA</p><h1 className="mt-3 text-2xl font-semibold text-gray-900">Choose a new password</h1><p className="mt-1 text-sm text-gray-500">Your new password must contain at least six characters.</p><div className="mt-6"><Suspense fallback={<p className="text-sm text-gray-500">Loading reset form...</p>}><ResetPasswordForm /></Suspense></div></section></main>;
}
