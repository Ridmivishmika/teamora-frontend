"use client";

import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("signin"); // signin | register

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 text-white flex-col justify-between p-12">
        <div className="space-y-6">
          <p className="text-sm tracking-widest text-orange-500 mb-8">TEAMORA</p>
          <h1 className="text-5xl font-serif leading-tight mb-6">
            Weekly Report<br />Generator &<br />Team Dashboard
          </h1>
          <div className="text-zinc-400 max-w-md ">
            Submit structured weekly work reports, track progress across tasks, and keep your manager aligned  all in one place.
          </div>
          <div className="space-y-6">
          <div className="flex gap-4">
            <span className="text-orange-500 font-medium">01</span>
            <div>
              <p className="font-medium">Structured reports</p>
              <p className="text-sm text-zinc-400">Consistent fields across every team member</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-orange-500 font-medium">02</span>
            <div>
              <p className="font-medium">Review workflow</p>
              <p className="text-sm text-zinc-400">Submit → Review → Approve cycle with comments</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-orange-500 font-medium">03</span>
            <div>
              <p className="font-medium">Team dashboard</p>
              <p className="text-sm text-zinc-400">Managers see the full picture at a glance</p>
            </div>
          </div>
        </div>
        </div>

        
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-50">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            {activeTab === "signin" ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {activeTab === "signin"
              ? "Enter your credentials to access the reporting suite."
              : "Register to start submitting weekly reports."}
          </p>

          {/* Tabs */}
          <div className="flex gap-6 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("signin")}
              className={`pb-3 text-sm font-medium transition ${
                activeTab === "signin"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`pb-3 text-sm font-medium transition ${
                activeTab === "register"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Register
            </button>
          </div>

          
          {/* Forms */}
          {activeTab === "signin" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}