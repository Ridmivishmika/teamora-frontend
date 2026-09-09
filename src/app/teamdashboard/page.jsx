"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { getDashboard } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function TeamDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  useEffect(() => {
    const currentUser = getUser();

    setUser(currentUser);
    setAuthChecked(true);

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    if (
      currentUser.role !== "MANAGER" &&
      currentUser.role !== "ADMIN"
    ) {
      router.replace("/weeklyreport");
    }
  }, [router]);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {
    if (!authChecked) return;
    if (!user) return;

    if (
      user.role !== "MANAGER" &&
      user.role !== "ADMIN"
    ) {
      return;
    }

    loadDashboard();
  }, [authChecked, user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getDashboard();

      console.log("Dashboard data:", result);

      setData(result);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err?.message || "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const members = Array.isArray(data?.members)
    ? data.members
    : [];

  const filteredMembers = members.filter((member) => {
    const name = member?.memberName || "";

    return name
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  // =====================================================
  // STATUS COLORS
  // =====================================================

  const statusColor = {
    APPROVED: "bg-green-100 text-green-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    NEEDS_CORRECTION: "bg-red-100 text-red-700",
    DRAFT: "bg-gray-100 text-gray-600",
    NOT_STARTED: "bg-gray-50 text-gray-400",
  };

  // =====================================================
  // INITIAL LOADING
  // =====================================================

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />

          <p className="text-gray-500 text-sm">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO USER
  // =====================================================

  if (!user) {
    return null;
  }

  // =====================================================
  // UNAUTHORIZED
  // =====================================================

  if (
    user.role !== "MANAGER" &&
    user.role !== "ADMIN"
  ) {
    return null;
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="min-h-screen bg-stone-50">

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-start justify-between mb-8">

          <div>

            {/* <p className="text-orange-600 text-sm font-medium tracking-wide mb-1">
              04 — MANAGER VIEW
            </p> */}

            <h1 className="text-3xl font-serif text-gray-900">
              Team Dashboard
            </h1>

            {/* <p className="text-gray-500 mt-1">
              Overview of all team member reports.
            </p> */}

          </div>

          {/* <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button> */}

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center justify-between gap-4">

              <span>{error}</span>

              <button
                type="button"
                onClick={loadDashboard}
                className="font-medium underline"
              >
                Try again
              </button>

            </div>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        {/* {data?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">

            <StatCard
              label="Approved"
              value={data.stats.approved ?? 0}
              color="text-green-600"
            />

            <StatCard
              label="Submitted"
              value={data.stats.submitted ?? 0}
              color="text-blue-600"
            />

            <StatCard
              label="Needs Correction"
              value={data.stats.needsCorrection ?? 0}
              color="text-red-600"
            />

            <StatCard
              label="Draft"
              value={data.stats.draft ?? 0}
              color="text-gray-600"
            />

            <StatCard
              label="Not Started"
              value={data.stats.notStarted ?? 0}
              color="text-gray-400"
            />

            <StatCard
              label="Total Hours"
              value={`${data.stats.totalHours ?? 0}h`}
              color="text-gray-800"
            />

          </div>
        )} */}

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="flex items-center gap-3 mb-4">

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search member..."
            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />

          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Clear
            </button>
          )}

        </div>

        {/* =================================================
            REPORT COUNT
        ================================================= */}

        {!loading && !error && (
          <p className="text-sm text-gray-500 mb-3">
            {filteredMembers.length} report
            {filteredMembers.length === 1 ? "" : "s"}
          </p>
        )}

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              {/* TABLE HEADER */}

              <thead className="bg-gray-50 text-gray-500 text-left">

                <tr>

                  <th className="px-4 py-3 font-medium whitespace-nowrap">
                    Member
                  </th>

                  <th className="px-4 py-3 font-medium whitespace-nowrap">
                    Project
                  </th>

                  <th className="px-4 py-3 font-medium whitespace-nowrap">
                    Status
                  </th>

                  <th className="px-4 py-3 font-medium whitespace-nowrap">
                    Tasks
                  </th>

                  <th className="px-4 py-3 font-medium whitespace-nowrap">
                    Hours
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Key Achievement
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Key Issue
                  </th>

                  <th className="px-4 py-3 font-medium text-right whitespace-nowrap">
                    Action
                  </th>

                </tr>

              </thead>

              {/* TABLE BODY */}

              <tbody>

                {/* LOADING */}

                {loading && (
                  <tr>

                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mb-3" />

                        <p className="text-gray-400">
                          Loading reports...
                        </p>

                      </div>

                    </td>

                  </tr>
                )}

                {/* ERROR */}

                {!loading && error && (
                  <tr>

                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center"
                    >

                      <p className="text-red-500 mb-3">
                        Unable to load reports.
                      </p>

                      <button
                        type="button"
                        onClick={loadDashboard}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                      >
                        Retry
                      </button>

                    </td>

                  </tr>
                )}

                {/* NO DATA */}

                {!loading &&
                  !error &&
                  filteredMembers.length === 0 && (
                    <tr>

                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center"
                      >

                        <p className="text-gray-400 text-base">
                          No reports found
                        </p>

                        {search && (
                          <p className="text-gray-400 text-sm mt-1">
                            Try a different member name.
                          </p>
                        )}

                      </td>

                    </tr>
                  )}

                {/* REPORTS */}

                {!loading &&
                  !error &&
                  filteredMembers.length > 0 &&
                  filteredMembers.map((member, index) => {

                    const totalTasks =
                      Number(member.totalTasks) || 0;

                    const completedTasks =
                      Number(member.completedTasks) || 0;

                    const taskPercentage =
                      totalTasks > 0
                        ? Math.min(
                            100,
                            Math.max(
                              0,
                              (completedTasks /
                                totalTasks) *
                                100
                            )
                          )
                        : 0;

                    const status =
                      member.status || "UNKNOWN";

                    const reportKey =
                      member.reportId ||
                      `${member.userId || "user"}-${index}`;

                    return (
                      <tr
                        key={reportKey}
                        className="border-t border-gray-100 hover:bg-gray-50 transition"
                      >

                        {/* MEMBER */}

                        <td className="px-4 py-3">

                          <div className="flex items-center gap-3">

                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                              {member.memberInitials ||
                                getInitials(
                                  member.memberName
                                )}
                            </div>

                            <span className="font-medium text-gray-900 whitespace-nowrap">
                              {member.memberName ||
                                "Unknown User"}
                            </span>

                          </div>

                        </td>

                        {/* PROJECT */}

                        <td className="px-4 py-3 text-gray-600">

                          {member.projectId || "—"}

                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-3">

                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                              statusColor[status] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {formatStatus(status)}
                          </span>

                        </td>

                        {/* TASKS */}

                        <td className="px-4 py-3">

                          {totalTasks > 0 ? (

                            <div className="flex items-center gap-2">

                              <span className="whitespace-nowrap text-gray-700">
                                {completedTasks}/
                                {totalTasks}
                              </span>

                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">

                                <div
                                  className="h-full bg-orange-500 rounded-full"
                                  style={{
                                    width: `${taskPercentage}%`,
                                  }}
                                />

                              </div>

                            </div>

                          ) : (
                            <span className="text-gray-400">
                              —
                            </span>
                          )}

                        </td>

                        {/* HOURS */}

                        <td className="px-4 py-3">

                          {member.totalHours !== null &&
                          member.totalHours !== undefined &&
                          Number(member.totalHours) > 0
                            ? `${member.totalHours}h`
                            : "—"}

                        </td>

                        {/* KEY ACHIEVEMENT */}

                        <td className="px-4 py-3 text-green-700 max-w-[220px]">

                          {member.keyAchievement ? (

                            <div
                              className="truncate"
                              title={
                                member.keyAchievement
                              }
                            >
                              ★ {member.keyAchievement}
                            </div>

                          ) : (
                            "—"
                          )}

                        </td>

                        {/* KEY ISSUE */}

                        <td className="px-4 py-3 text-red-600 max-w-[220px]">

                          {member.keyIssue ? (

                            <div
                              className="truncate"
                              title={member.keyIssue}
                            >
                              ! {member.keyIssue}
                            </div>

                          ) : (
                            "—"
                          )}

                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-3 text-right">

                          {member.reportId ? (

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/review/${member.reportId}`
                                )
                              }
                              className="text-sm px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition whitespace-nowrap"
                            >
                              Review
                            </button>

                          ) : (

                            <span className="text-gray-400 text-xs">
                              —
                            </span>

                          )}

                        </td>

                      </tr>
                    );
                  })}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  );
}


// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  label,
  value,
  color,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">

      <p className="text-xs text-gray-500 mb-1">
        {label}
      </p>

      <p
        className={`text-2xl font-semibold ${color}`}
      >
        {value}
      </p>

    </div>
  );
}


// =====================================================
// FORMAT STATUS
// =====================================================

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}


// =====================================================
// GET INITIALS
// =====================================================

function getInitials(name) {
  if (!name) {
    return "U";
  }

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
}