"use client";

import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
    <section className="w-full max-w-md border border-gray-200 bg-white p-7 shadow-sm">
      <p className="text-sm font-semibold tracking-wide text-orange-700">TEAMORA</p>
      <h1 className="mt-3 text-2xl font-semibold text-gray-900">Create your account</h1>
      <p className="mt-1 text-sm text-gray-500">New accounts start as team members. Administrators manage roles.</p>
      <div className="mt-6"><RegisterForm /></div>
      <p className="mt-5 text-center text-sm text-gray-600">Already have an account? <Link className="font-medium text-orange-700 hover:underline" href="/login">Sign in</Link></p>
    </section>
  </main>;
}
