import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return <AuthShell title="Reset your password" description="Enter your email and we will send a reset link if an account exists."><ForgotPasswordForm /></AuthShell>;
}
function AuthShell({ title, description, children }) { return <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10"><section className="w-full max-w-md border border-gray-200 bg-white p-7 shadow-sm"><p className="text-sm font-semibold tracking-wide text-orange-700">TEAMORA</p><h1 className="mt-3 text-2xl font-semibold text-gray-900">{title}</h1><p className="mt-1 text-sm text-gray-500">{description}</p><div className="mt-6">{children}</div></section></main>; }
