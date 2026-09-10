const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
// ========== Helper ==========
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ========== AUTH ==========
export async function registerUser(data) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || result.message || "Registration failed");
  }

  return result;
}

export async function loginUser(data) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || result.message || "Login failed");
  }

  return result;
}

export async function requestPasswordReset(email) {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Unable to request a password reset");
  return result;
}

export async function resetPassword(token, password) {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.error || "Unable to reset password");
  }
}

// ========== REPORTS ==========
export async function createReport(data) {
  const res = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || result.message || "Failed to create report");
  return result;
}

export async function updateReport(id, data) {
  const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || result.message || "Failed to update report");
  return result;
}

export async function submitReport(id) {
  const res = await fetch(`${API_BASE_URL}/reports/${id}/submit`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || result.message || "Failed to submit report");
  return result;
}

export async function getMyReports() {
  const res = await fetch(`${API_BASE_URL}/reports/my`, {
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || result.message || "Failed to fetch reports");
  return result;
}

export async function getReportById(id) {
  const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || result.message || "Failed to fetch report");
  return result;
}

// ========== MANAGER ==========
export async function getDashboard(filters = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  const res = await fetch(
    `${API_BASE_URL}/reports/dashboard${params.size ? `?${params}` : ""}`,
    { headers: getAuthHeaders() }
  );
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to load dashboard");
  return result;
}

export async function reviewReport(id, data) {
  const res = await fetch(`${API_BASE_URL}/reports/${id}/review`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Review failed");
  return result;
}

// ========== PROJECTS ==========
export async function getProjects(all = false) {
  const res = await fetch(`${API_BASE_URL}/projects?all=${all}`, {
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to load projects");
  return result;
}

export async function createProject(data) {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to create project");
  return result;
}

export async function updateProject(id, data) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to update project");
  return result;
}

export async function deleteProject(id) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.error || "Failed to delete project");
  }
  return true;
}

// Assign members → PUT /api/projects/{id}/members
export async function assignMembersToProject(projectId, memberIds) {
  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ memberIds }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to assign members");
  return result;
}

// List team members → GET /api/users/role/TEAM_MEMBER
export async function getTeamMembers() {
  const res = await fetch(`${API_BASE_URL}/users/role/TEAM_MEMBER`, {
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to load team members");
  return result;
}

// ========== VERSIONS ==========
export async function getReportVersions(reportId) {
  const res = await fetch(`${API_BASE_URL}/reports/${reportId}/versions`, {
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to load versions");
  return result;
}


// ========== USERS (Admin) ==========
export async function getAllUsers() {
  const res = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to load users");
  return result;
}

export async function createUser(data) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to create user");
  return result;
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to update user");
  return result;
}

export async function deactivateUser(id) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.error || "Failed to deactivate user");
  }
}

export async function activateUser(id) {
  const res = await fetch(`${API_BASE_URL}/users/${id}/activate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.error || "Failed to activate user");
  }
}
