"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser, logout } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const user = getUser();

  const isManager = user?.role === "MANAGER" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";
  const isTeamMemberOrManager =
    user?.role === "TEAM_MEMBER" || user?.role === "MANAGER";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-semibold tracking-wide text-gray-800">
          TEAMORA
        </Link>

        <nav className="flex gap-1">
          {/* Team Dashboard – Manager + Admin */}
          {isManager && (
            <Link
              href="/teamdashboard"
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                pathname.includes("teamdashboard")
                  ? "bg-orange-100 text-orange-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Team Dashboard
            </Link>
          )}

          {/* Projects – Manager + Admin */}
          {isManager && (
            <Link
              href="/projects"
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                pathname.includes("projects")
                  ? "bg-orange-100 text-orange-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Projects
            </Link>
          )}
          

        {isManager && (
            <Link
              href="/summary"
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                pathname.includes("summary")
                  ? "bg-orange-100 text-orange-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Summary
            </Link>
          )}
          
          {/* My Report – only Team Member + Manager (hidden for Admin) */}
          {isTeamMemberOrManager && (
            <Link
              href="/weeklyreport"
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                pathname.includes("weeklyreport")
                  ? "bg-orange-100 text-orange-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              My Report
            </Link>
          )}

          {/* History – only Team Member + Manager (hidden for Admin) */}
          {isTeamMemberOrManager && (
            <Link
              href="/history"
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                pathname.includes("history")
                  ? "bg-orange-100 text-orange-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              History
            </Link>
          )}

          {user?.role === "ADMIN" && (
  <Link
    href="/users"
    className={`px-4 py-1.5 rounded-full text-sm font-medium ${
      pathname.includes("users")
        ? "bg-orange-100 text-orange-800"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    Users
  </Link>
)}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.role?.replace("_", " ")}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-medium text-sm">
              {user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          </>
        )}
        <button
          onClick={logout}
          className="text-sm border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}