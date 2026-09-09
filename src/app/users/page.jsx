"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { getAllUsers, createUser, updateUser, deactivateUser, activateUser } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function UsersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Invite form
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "TEAM_MEMBER",
  });

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    setUser(u);

    if (!u) {
      router.replace("/login");
      return;
    }
    if (u.role !== "ADMIN") {
      router.replace("/summary");
      return;
    }

    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await createUser(form);
      setMessage("User invited successfully");
      setShowInvite(false);
      setForm({ name: "", email: "", password: "", role: "TEAM_MEMBER" });
      loadUsers();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUser(id, { role: newRole });
      loadUsers();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleToggleActive = async (u) => {
    try {
      if (u.active) {
        await deactivateUser(u.id);
      } else {
        await activateUser(u.id);
      }
      loadUsers();
    } catch (err) {
      setMessage(err.message);
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            {/* <p className="text-orange-600 text-sm font-medium tracking-wide mb-1">
              05 — ADMIN
            </p> */}
            <h1 className="text-3xl font-serif text-gray-900">User Management</h1>
            {/* <p className="text-gray-500 mt-1">Invite, manage roles and activate/deactivate users.</p> */}
          </div>

          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
          >
            + Invite User
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-3 rounded-md text-sm ${
            message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}>
            {message}
          </div>
        )}

        {/* Invite Modal */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-lg font-medium mb-4">Invite New User</h2>
              <form onSubmit={handleInvite} className="space-y-4">
                <input
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  required
                  type="password"
                  placeholder="Temporary password (min 6)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="TEAM_MEMBER">Team Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInvite(false)}
                    className="px-4 py-2 text-sm border rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-sm bg-white"
                      >
                        <option value="TEAM_MEMBER">Team Member</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`text-sm ${
                          u.active ? "text-red-600 hover:underline" : "text-green-600 hover:underline"
                        }`}
                      >
                        {u.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
