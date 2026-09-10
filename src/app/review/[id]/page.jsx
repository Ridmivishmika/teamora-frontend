"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { getReportById, reviewReport } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function ReportReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = getUser();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      const data = await getReportById(id);
      setReport(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (action) => {
    if (action === "REQUEST_CHANGES" && !comment.trim()) {
      setMessage("Please write a comment when requesting changes");
      return;
    }

    setActionLoading(true);
    setMessage("");
    try {
      const updated = await reviewReport(id, {
        action,
        comment: comment || (action === "APPROVE" ? "Report is satisfactory" : ""),
      });
      setReport(updated);
      setSelectedAction(null);
      setComment("");
      setMessage(action === "APPROVE" ? "Report approved!" : "Changes requested");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="p-10 text-center text-gray-400">Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="p-10 text-center text-red-500">{message || "Report not found"}</div>
      </div>
    );
  }

  const totalHours = report.hoursWorked?.reduce((s, h) => s + (h.hours || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <button
              onClick={() => router.push("/teamdashboard")}
              className="text-sm text-gray-500 hover:text-gray-800 mb-2"
            >
              ← Dashboard
            </button>
            <h1 className="text-2xl font-serif text-gray-900">Weekly Report Review</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
              <span className="font-medium">{report.userId}</span>
              <span>•</span>
              <span>{report.weekStart} – {report.weekEnd}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                {report.status}
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-3 rounded-md text-sm ${
            message.includes("approved") || message.includes("requested")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left – Report Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tasks */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-500 mb-4">02 Tasks Completed</h2>
              {report.tasks?.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Task</th>
                      <th className="pb-2">Priority</th>
                      <th className="pb-2">Planned %</th>
                      <th className="pb-2">Actual %</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Planned</th>
                      <th className="pb-2">Spent</th>
                      <th className="pb-2">Deliverable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.tasks.map((t, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-2">{t.taskName}</td>
                        <td className="py-2">{t.priority}</td>
                        <td className="py-2">{t.plannedPercent}%</td>
                        <td className="py-2">{t.actualPercent}%</td>
                        <td className="py-2">{t.status}</td>
                        <td className="py-2">{t.timePlanned}h</td>
                        <td className="py-2">{t.timeSpent}h</td>
                        <td className="py-2">{t.deliverable}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400 text-sm">No tasks</p>
              )}
            </section>

            {/* Next Week */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-500 mb-3">03 Tasks Planned for Next Week</h2>
              <p className="text-sm whitespace-pre-line">{report.tasksPlannedNextWeek || "—"}</p>
            </section>

            {/* Blockers */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-500 mb-3">04 Blockers / Challenges</h2>
              <div className="space-y-2">
                {report.blockers?.map((b, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-sm ${
                      b.isKeyIssue ? "bg-orange-50 border border-orange-200" : "bg-gray-50"
                    }`}
                  >
                    {b.isKeyIssue && <span className="text-xs text-orange-600 font-medium mr-2">KEY</span>}
                    {b.description}
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-500 mb-3">05 Achievements / Highlights</h2>
              <div className="space-y-2">
                {report.achievements?.map((a, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-sm ${
                      a.isKeyAchievement ? "bg-green-50 border border-green-200" : "bg-gray-50"
                    }`}
                  >
                    {a.isKeyAchievement && <span className="text-xs text-green-600 font-medium mr-2">KEY WIN</span>}
                    {a.description}
                  </div>
                ))}
              </div>
            </section>

            {/* Hours */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-500 mb-3">06 Hours Breakdown</h2>
              <div className="grid grid-cols-4 gap-3">
                {report.hoursWorked?.map((h) => (
                  <div key={h.taskType} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold">{h.hours}h</p>
                    <p className="text-xs text-gray-500 capitalize">{h.taskType.toLowerCase()}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-500">Total: {totalHours}h</p>
            </section>

            {/* Notes */}
            {report.notes && (
              <section className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-medium text-gray-500 mb-3">07 Notes / Links</h2>
                <p className="text-sm whitespace-pre-line">{report.notes}</p>
              </section>
            )}
          </div>

          {/* Right – Review Panel */}
          <div className="space-y-6">
            {/* Review History */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-500 mb-4">REVIEW HISTORY</h2>
              {report.reviewComments?.length > 0 ? (
                <div className="space-y-4">
                  {report.reviewComments.map((c, i) => (
                    <div key={i} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{c.reviewerName || "Manager"}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          c.action === "APPROVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {c.action === "APPROVE" ? "Approved" : "Needs Correction"}
                        </span>
                      </div>
                      <p className="text-gray-600">{c.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No reviews yet</p>
              )}
            </section>

            {/* Take Action */}
            {(report.status === "SUBMITTED" || report.status === "NEEDS_CORRECTION") && (
              <section className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-medium text-gray-500 mb-4">TAKE ACTION</h2>

                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedAction("APPROVE")}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedAction === "APPROVE"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <p className="font-medium text-green-700">✓ Approve</p>
                    <p className="text-xs text-gray-500">Report is satisfactory</p>
                  </button>

                  <button
                    onClick={() => setSelectedAction("REQUEST_CHANGES")}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedAction === "REQUEST_CHANGES"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <p className="font-medium text-red-700">↩ Request Changes</p>
                    <p className="text-xs text-gray-500">Send back with a comment</p>
                  </button>
                </div>

                {selectedAction && (
                  <div className="mt-4">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder={selectedAction === "APPROVE" ? "Optional comment..." : "Explain what needs to be changed..."}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3"
                    />
                    <button
                      onClick={() => handleReview(selectedAction)}
                      disabled={actionLoading}
                      className={`w-full py-2.5 rounded-md text-white text-sm font-medium disabled:opacity-50 ${
                        selectedAction === "APPROVE" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {actionLoading ? "Processing..." : selectedAction === "APPROVE" ? "Confirm Approve" : "Send Request"}
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
