"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getTeamMembers,
  assignMembersToProject,
} from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const router = useRouter();
  const user = getUser();

  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create form
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  // Edit modal
  const [editing, setEditing] = useState(null); // project object or null
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editActive, setEditActive] = useState(true);

  // Assign modal
  const [assigning, setAssigning] = useState(null); // project object or null
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  useEffect(() => {
    if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
      router.push("/weeklyreport");
      return;
    }
    loadProjects();
    loadMembers();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects(true);
      setProjects(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await getTeamMembers();
      setMembers(data || []);
    } catch (err) {
      // Backend may not have this endpoint yet – ignore
      console.warn("Could not load team members:", err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createProject({ name: name.trim(), code: code.trim() || null });
      setName("");
      setCode("");
      await loadProjects();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (p) => {
    setEditing(p);
    setEditName(p.name || "");
    setEditCode(p.code || "");
    setEditActive(p.active !== false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing || !editName.trim()) return;
    setLoading(true);
    try {
      await updateProject(editing.id, {
        name: editName.trim(),
        code: editCode.trim() || null,
        active: editActive,
      });
      setEditing(null);
      await loadProjects();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete project "${p.name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await deleteProject(p.id);
      await loadProjects();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAssign = (p) => {
    setAssigning(p);
    // Pre-select already assigned members if backend returns them
    const existing = p.memberIds || p.members?.map((m) => m.id) || [];
    setSelectedMemberIds(existing);
  };

  const toggleMember = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (!assigning) return;
    setLoading(true);
    try {
      await assignMembersToProject(assigning.id, selectedMemberIds);
      setAssigning(null);
      await loadProjects();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-serif text-gray-900 mb-2">Projects / Categories</h1>
        {/* <p className="text-sm text-gray-500 mb-6">
          Manage projects that can be attached to weekly reports (e.g. Client A, Internal Tooling, R&amp;D, Marketing).
        </p> */}

        {/* Create form */}
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border p-5 mb-6 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-gray-500 mb-1">Project name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Client A"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="w-28">
            <label className="block text-xs text-gray-500 mb-1">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="PE"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 disabled:opacity-50"
          >
            Add
          </button>
        </form>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No projects yet. Add one above.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{p.code || "—"}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          p.active !== false
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p.active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-sm text-orange-700 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openAssign(p)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-medium mb-4">Edit Project</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Code</label>
                <input
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Members Modal */}
      {assigning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-medium mb-1">Assign Team Members</h2>
            <p className="text-sm text-gray-500 mb-4">
              Project: <strong>{assigning.name}</strong>
            </p>

            {members.length === 0 ? (
              <p className="text-sm text-gray-400 mb-4">
                No team members loaded. (Backend endpoint <code>/users?role=TEAM_MEMBER</code> may be missing.)
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                {members.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.includes(m.id)}
                      onChange={() => toggleMember(m.id)}
                    />
                    <span className="text-sm">
                      {m.name || m.email}{" "}
                      <span className="text-gray-400 text-xs">({m.role})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssigning(null)}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={loading || members.length === 0}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Save assignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}