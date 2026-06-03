export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("token") && getStoredUser());
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
