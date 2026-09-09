"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { createReport, updateReport, submitReport, getProjects } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function WeeklyReportPage() {
  const router = useRouter();

  // Hydration-safe auth
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  const [reportId, setReportId] = useState(null);
  const [status, setStatus] = useState("DRAFT");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Form state
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [projectId, setProjectId] = useState("");
  const [tasksPlannedNextWeek, setTasksPlannedNextWeek] = useState("");
  const [notes, setNotes] = useState("");

  const [tasks, setTasks] = useState([]);
  const [blockers, setBlockers] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const [hoursWorked, setHoursWorked] = useState([
    { taskType: "DEVELOPMENT", hours: 0 },
    { taskType: "TESTING", hours: 0 },
    { taskType: "MEETINGS", hours: 0 },
    { taskType: "DOCUMENTATION", hours: 0 },
  ]);

  // Projects for dropdown
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // setMounted(true);
    // const u = getUser();
    // setUser(u);
    // if (!u) {
    //   router.replace("/login");
    //   return;
    // }

    setMounted(true);
  const u = getUser();
  setUser(u);

  if (!u) {
    router.replace("/login");
    return;
  }

  // Block Admin from My Report page
  if (u.role === "ADMIN") {
    router.replace("/summary");
    return;
  }

    // Load projects
    getProjects()
      .then((data) => setProjects(data || []))
      .catch((err) => console.error("Failed to load projects:", err));
  }, [router]);

  // ===== Task helpers =====
  const addTask = () => {
    setTasks([
      ...tasks,
      {
        taskName: "",
        priority: "MEDIUM",
        plannedPercent: 0,
        actualPercent: 0,
        status: "TODO",
        timePlanned: 0,
        timeSpent: 0,
        deliverable: "",
        sortOrder: tasks.length + 1,
      },
    ]);
  };

  const updateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // ===== Blocker helpers =====
  const addBlocker = () => {
    setBlockers([
      ...blockers,
      { description: "", isKeyIssue: false, sortOrder: blockers.length + 1 },
    ]);
  };

  const updateBlocker = (index, field, value) => {
    const updated = [...blockers];
    updated[index][field] = value;
    setBlockers(updated);
  };

  const removeBlocker = (index) => {
    setBlockers(blockers.filter((_, i) => i !== index));
  };

  // ===== Achievement helpers =====
  const addAchievement = () => {
    setAchievements([
      ...achievements,
      {
        description: "",
        isKeyAchievement: false,
        sortOrder: achievements.length + 1,
      },
    ]);
  };

  const updateAchievement = (index, field, value) => {
    const updated = [...achievements];
    updated[index][field] = value;
    setAchievements(updated);
  };

  const removeAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  // ===== Hours helpers =====
  const updateHours = (type, value) => {
    setHoursWorked(
      hoursWorked.map((h) =>
        h.taskType === type ? { ...h, hours: Number(value) || 0 } : h
      )
    );
  };

  const totalHours = hoursWorked.reduce((sum, h) => sum + (h.hours || 0), 0);

  // ===== Build payload =====
  const buildPayload = () => ({
    weekStart,
    weekEnd,
    projectId: projectId || null,
    tasksPlannedNextWeek,
    notes,
    tasks: tasks.map((t, i) => ({ ...t, sortOrder: i + 1 })),
    blockers: blockers.map((b, i) => ({ ...b, sortOrder: i + 1 })),
    achievements: achievements.map((a, i) => ({ ...a, sortOrder: i + 1 })),
    hoursWorked,
  });

  // ===== Save Draft =====
  const handleSaveDraft = async () => {
    if (!weekStart || !weekEnd) {
      setMessage("Please select Week Start and Week End dates");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const payload = buildPayload();
      let result;
      if (reportId) {
        result = await updateReport(reportId, payload);
      } else {
        result = await createReport(payload);
        setReportId(result.id);
      }
      setStatus(result.status);
      setMessage("Draft saved successfully!");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== Submit =====
  const handleSubmit = async () => {
    if (!weekStart || !weekEnd) {
      setMessage("Please select Week Start and Week End dates");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const payload = buildPayload();
      let currentId = reportId;

      if (!currentId) {
        const created = await createReport(payload);
        currentId = created.id;
        setReportId(currentId);
      } else {
        await updateReport(currentId, payload);
      }

      const result = await submitReport(currentId);
      setStatus(result.status);
      setMessage("Report submitted for review!");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            {/* <p className="text-orange-600 text-sm font-medium tracking-wide mb-1">
              02 — PERSONAL REPORT
            </p> */}
            <h1 className="text-3xl font-serif text-gray-900">Weekly Work Report</h1>
            <p className="text-gray-500 mt-1">
              {weekStart && weekEnd ? `${weekStart} – ${weekEnd}` : "Select week dates"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600">
              {status}
            </span>
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-white disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || status === "SUBMITTED" || status === "APPROVED"}
              className="px-4 py-2 text-sm bg-orange-700 text-white rounded-md hover:bg-orange-800 disabled:opacity-50"
            >
              Submit for Review
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-3 rounded-md text-sm ${
              message.includes("success") || message.includes("submitted")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {/* 01. Period & Project */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">
            01 Report Period & Project
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Week start</label>
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Week end</label>
              <input
                type="date"
                value={weekEnd}
                onChange={(e) => setWeekEnd(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Project / Category
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code ? `${p.code} – ${p.name}` : p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 02. Tasks Completed */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">02 Tasks Completed</h2>

          {tasks.length === 0 ? (
            <p className="text-sm text-gray-400 mb-4">No tasks added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Task Name</th>
                    <th className="pb-2 font-medium">Priority</th>
                    <th className="pb-2 font-medium">Planned to finish %</th>
                    <th className="pb-2 font-medium">Actually finished %</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Time Planned</th>
                    <th className="pb-2 font-medium">Time Spent</th>
                    <th className="pb-2 font-medium">Output / Deliverable</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 pr-2">
                        <input
                          value={task.taskName}
                          onChange={(e) => updateTask(index, "taskName", e.target.value)}
                          className="w-full border border-gray-200 rounded px-2 py-1.5"
                          placeholder="Task name"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          value={task.priority}
                          onChange={(e) => updateTask(index, "priority", e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1.5"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={task.plannedPercent}
                          onChange={(e) =>
                            updateTask(index, "plannedPercent", Number(e.target.value))
                          }
                          className="w-16 border border-gray-200 rounded px-2 py-1.5"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={task.actualPercent}
                          onChange={(e) =>
                            updateTask(index, "actualPercent", Number(e.target.value))
                          }
                          className="w-16 border border-gray-200 rounded px-2 py-1.5"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          value={task.status}
                          onChange={(e) => updateTask(index, "status", e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1.5"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Completed</option>
                          <option value="BLOCKED">Blocked</option>
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={task.timePlanned}
                          onChange={(e) =>
                            updateTask(index, "timePlanned", Number(e.target.value))
                          }
                          className="w-16 border border-gray-200 rounded px-2 py-1.5"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={task.timeSpent}
                          onChange={(e) =>
                            updateTask(index, "timeSpent", Number(e.target.value))
                          }
                          className="w-16 border border-gray-200 rounded px-2 py-1.5"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          value={task.deliverable}
                          onChange={(e) => updateTask(index, "deliverable", e.target.value)}
                          className="w-full border border-gray-200 rounded px-2 py-1.5"
                          placeholder="Deliverable"
                        />
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => removeTask(index)}
                          className="text-gray-400 hover:text-red-500 text-lg"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="button"
            onClick={addTask}
            className="mt-4 text-sm text-orange-700 hover:underline"
          >
            + Add task
          </button>
        </section>

        {/* 03. Tasks Planned for Next Week */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">
            03 Tasks Planned for Next Week
          </h2>
          <textarea
            value={tasksPlannedNextWeek}
            onChange={(e) => setTasksPlannedNextWeek(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="List tasks planned for next week..."
          />
        </section>

        {/* 04. Blockers */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            04 Blockers / Challenges
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Flag one as the key issue for the week by clicking the star.
          </p>

          {blockers.length === 0 ? (
            <p className="text-sm text-gray-400 mb-4">No blockers added yet.</p>
          ) : (
            <div className="space-y-3">
              {blockers.map((blocker, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    blocker.isKeyIssue
                      ? "border-orange-300 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const updated = blockers.map((b, i) => ({
                        ...b,
                        isKeyIssue: i === index ? !b.isKeyIssue : false,
                      }));
                      setBlockers(updated);
                    }}
                    className={`mt-1 text-lg ${
                      blocker.isKeyIssue ? "text-orange-500" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                  <input
                    value={blocker.description}
                    onChange={(e) =>
                      updateBlocker(index, "description", e.target.value)
                    }
                    className="flex-1 border-0 bg-transparent focus:outline-none text-sm"
                    placeholder="Describe the blocker..."
                  />
                  <button
                    type="button"
                    onClick={() => removeBlocker(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addBlocker}
            className="mt-4 text-sm text-orange-700 hover:underline"
          >
            + Add blocker
          </button>
        </section>

        {/* 05. Achievements */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            05 Achievements / Highlights
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Flag one as the key achievement for the week.
          </p>

          {achievements.length === 0 ? (
            <p className="text-sm text-gray-400 mb-4">No achievements added yet.</p>
          ) : (
            <div className="space-y-3">
              {achievements.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    item.isKeyAchievement
                      ? "border-orange-300 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const updated = achievements.map((a, i) => ({
                        ...a,
                        isKeyAchievement: i === index ? !a.isKeyAchievement : false,
                      }));
                      setAchievements(updated);
                    }}
                    className={`mt-1 text-lg ${
                      item.isKeyAchievement ? "text-orange-500" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                  <input
                    value={item.description}
                    onChange={(e) =>
                      updateAchievement(index, "description", e.target.value)
                    }
                    className="flex-1 border-0 bg-transparent focus:outline-none text-sm"
                    placeholder="Describe the achievement..."
                  />
                  <button
                    type="button"
                    onClick={() => removeAchievement(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addAchievement}
            className="mt-4 text-sm text-orange-700 hover:underline"
          >
            + Add achievement
          </button>
        </section>

        {/* 06. Hours Breakdown */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">06 Hours Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hoursWorked.map((h) => (
              <div key={h.taskType}>
                <label className="block text-sm text-gray-600 mb-1 capitalize">
                  {h.taskType.toLowerCase()}
                </label>
                <input
                  type="number"
                  value={h.hours}
                  onChange={(e) => updateHours(h.taskType, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  min="0"
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Total: <span className="font-medium text-gray-800">{totalHours}h</span>
          </p>
        </section>

        {/* 07. Notes */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-4">
            07 Notes / Links (Optional)
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Any additional context, links to docs, tickets, or references..."
          />
        </section>

        {/* Bottom buttons */}
        <div className="flex justify-end gap-3 pb-12">
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="px-6 py-2.5 text-sm border border-gray-300 rounded-md hover:bg-white disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || status === "SUBMITTED" || status === "APPROVED"}
            className="px-6 py-2.5 text-sm bg-orange-700 text-white rounded-md hover:bg-orange-800 disabled:opacity-50"
          >
            Submit for Review
          </button>
        </div>
      </main>
    </div>
  );
}
