const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function getAuthHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

export function toUploadUrl(filePath) {
  if (!filePath) return "";
  const normalized = String(filePath).replace(/\\/g, "/");
  if (normalized.startsWith("http")) return normalized;
  
  // If it already contains uploads/, extract the relative part and prepend API_BASE_URL
  if (normalized.includes("uploads/")) {
    const relative = normalized.slice(normalized.indexOf("uploads/"));
    return `${API_BASE_URL}/${relative}`;
  }
  
  // Otherwise, prepend /uploads/
  return `${API_BASE_URL}/uploads/${normalized.replace(/^\/+/, "")}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Erreur API");
  }

  return data;
}

export async function loginRequest(payload) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function signupRequest(formData) {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: formData,
  });
}

export async function getTeacherDashboard() {
  return apiRequest("/api/teacher/dashboard", {
    headers: getAuthHeaders(),
  });
}

export async function getTeacherClassesSummary() {
  return apiRequest("/api/teacher/classes/summary", {
    headers: getAuthHeaders(),
  });
}

export async function getTeacherClassRoster(studyClass) {
  const enc = encodeURIComponent(studyClass);
  return apiRequest(`/api/teacher/classes/${enc}/roster`, {
    headers: getAuthHeaders(),
  });
}

export async function saveTeacherAttendance(payload) {
  return apiRequest("/api/teacher/attendance", {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}

export async function getTeacherCourses() {
  return apiRequest("/api/teacher/courses", {
    headers: getAuthHeaders(),
  });
}

export async function createTeacherCourse(formData) {
  return apiRequest("/api/teacher/courses", {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
}

export async function updateTeacherCourse(courseId, formData) {
  return apiRequest(`/api/teacher/courses/${courseId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  });
}

export async function deleteTeacherCourse(courseId) {
  return apiRequest(`/api/teacher/courses/${courseId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

export async function assignStudentsToCourse(courseId, payload) {
  return apiRequest(`/api/teacher/courses/${courseId}/students`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}

export async function getCourseStudents(courseId, q = "") {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return apiRequest(`/api/teacher/courses/${courseId}/students${query}`, {
    headers: getAuthHeaders(),
  });
}

export async function getStudentProfile(studentId) {
  return apiRequest(`/api/teacher/students/${studentId}`, {
    headers: getAuthHeaders(),
  });
}

export async function getTeacherAssignments() {
  return apiRequest("/api/teacher/assignments", {
    headers: getAuthHeaders(),
  });
}

export async function createTeacherAssignment(formData) {
  return apiRequest("/api/teacher/assignments", {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
}

export async function getAssignmentSubmissions(assignmentId) {
  return apiRequest(`/api/teacher/assignments/${assignmentId}/submissions`, {
    headers: getAuthHeaders(),
  });
}

export async function getTeacherGrades(courseId = "") {
  const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
  return apiRequest(`/api/teacher/grades${query}`, {
    headers: getAuthHeaders(),
  });
}

export async function updateSubmissionGrade(submissionId, payload) {
  return apiRequest(`/api/teacher/grades/${submissionId}`, {
    method: "PATCH",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}

export async function exportTeacherGradesCsv() {
  const response = await fetch(`${API_BASE_URL}/api/teacher/grades/export/csv`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Export failed");
  }
  return response.blob();
}

export async function sendMessageToStudents(payload) {
  return apiRequest("/api/teacher/messages", {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}

export async function getTeacherNotifications() {
  return apiRequest("/api/teacher/notifications", {
    headers: getAuthHeaders(),
  });
}

export async function getTeacherMessages(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.box) search.set("box", params.box);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return apiRequest(`/api/teacher/messages${suffix}`, {
    headers: getAuthHeaders(),
  });
}

export async function markNotificationAsRead(notificationId) {
  return apiRequest(`/api/teacher/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
}

export async function getStudentDashboard() {
  return apiRequest("/api/student/dashboard", {
    headers: getAuthHeaders(),
  });
}

export async function getStudentCourses() {
  return apiRequest("/api/student/courses", {
    headers: getAuthHeaders(),
  });
}

export async function getStudentCourseById(courseId) {
  return apiRequest(`/api/student/courses/${courseId}`, {
    headers: getAuthHeaders(),
  });
}

export async function getStudentAssignments(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.courseId) search.set("courseId", params.courseId);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return apiRequest(`/api/student/assignments${suffix}`, {
    headers: getAuthHeaders(),
  });
}

export async function submitStudentAssignment(formData) {
  return apiRequest("/api/student/submissions", {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
}

export async function getStudentSubmissions(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return apiRequest(`/api/student/submissions${suffix}`, {
    headers: getAuthHeaders(),
  });
}

export async function getStudentGrades() {
  return apiRequest("/api/student/grades", {
    headers: getAuthHeaders(),
  });
}

export const getStudentAbsences = () => api.get("/student/absences").then((res) => res.data);

export async function downloadStudentGradeReport() {
  const response = await fetch(`${API_BASE_URL}/api/student/grades/report`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Report download failed");
  }
  return response.blob();
}

export async function getStudentSchedule() {
  return apiRequest("/api/student/schedule", {
    headers: getAuthHeaders(),
  });
}

export async function getStudentMessages(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.box) search.set("box", params.box);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return apiRequest(`/api/student/messages${suffix}`, {
    headers: getAuthHeaders(),
  });
}

export async function sendStudentMessage(payload) {
  return apiRequest("/api/student/messages", {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}

export async function getStudentDocuments() {
  return apiRequest("/api/student/documents", {
    headers: getAuthHeaders(),
  });
}

export async function getOwnStudentProfile() {
  return apiRequest("/api/student/profile", {
    headers: getAuthHeaders(),
  });
}

export async function updateStudentProfile(formData) {
  return apiRequest("/api/student/profile", {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  });
}

export async function getStudentNotifications() {
  return apiRequest("/api/student/notifications", {
    headers: getAuthHeaders(),
  });
}

export async function markStudentNotificationRead(notificationId) {
  return apiRequest(`/api/student/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
}

export async function getAdminStats() {
  return apiRequest("/api/admin/stats", {
    headers: getAuthHeaders(),
  });
}

export async function updateUserStatus(userId, status) {
  return apiRequest(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });
}

export async function resetUserPassword(userId) {
  return apiRequest(`/api/admin/users/${userId}/reset-password`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
}

export async function getPublicTeachers() {
  return apiRequest("/api/public/teachers");
}

const api = {
  get: (path, options = {}) => {
    const searchParams = options.params ? `?${new URLSearchParams(options.params).toString()}` : "";
    return apiRequest(`/api${path}${searchParams}`, {
      method: "GET",
      headers: getAuthHeaders(options.headers || {})
    }).then(data => ({ data }));
  },
  post: (path, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const headers = getAuthHeaders(options.headers || {});
    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }
    return apiRequest(`/api${path}`, {
      method: "POST",
      headers,
      body,
    }).then(data => ({ data }));
  },
  patch: (path, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const headers = getAuthHeaders(options.headers || {});
    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }
    return apiRequest(`/api${path}`, {
      method: "PATCH",
      headers,
      body,
    }).then(data => ({ data }));
  },
  put: (path, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const headers = getAuthHeaders(options.headers || {});
    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }
    return apiRequest(`/api${path}`, {
      method: "PUT",
      headers,
      body,
    }).then(data => ({ data }));
  },
  delete: (path, options = {}) => {
    return apiRequest(`/api${path}`, {
      method: "DELETE",
      headers: getAuthHeaders(options.headers || {}),
    }).then(data => ({ data }));
  }
};

export { API_BASE_URL };
export default api;
