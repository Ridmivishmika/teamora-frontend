"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { getMyReports } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function HistoryPage() {
  const router = useRouter();
  const user = getUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    getMyReports()
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, router]);

  const statusColor = {
    APPROVED: "bg-green-100 text-green-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    NEEDS_CORRECTION: "bg-red-100 text-red-700",
    DRAFT: "bg-gray-100 text-gray-600",
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-serif mb-2">My Report History</h1>
        {/* <p className="text-gray-500 mb-8">All your past weekly reports</p> */}

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-400">
            No reports yet. Create your first weekly report.
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  if (r.status === "DRAFT" || r.status === "NEEDS_CORRECTION") {
                    router.push("/weeklyreport");
                  } else {
                    router.push(`/review/${r.id}`);
                  }
                }}
                className="bg-white border rounded-xl p-4 flex items-center justify-between hover:shadow-sm cursor-pointer"
              >
                <div>
                  <p className="font-medium">
                    {r.weekStart} – {r.weekEnd}
                  </p>
                  <p className="text-sm text-gray-500">
                    {r.projectName || r.projectId || "No project"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusColor[r.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {r.status?.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}