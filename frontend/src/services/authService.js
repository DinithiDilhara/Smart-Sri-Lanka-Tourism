const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    const responseText = response.status === 204 ? "" : await response.text();
    let data = null;
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          response.ok
            ? "The account service returned an invalid response."
            : `Authentication request failed (${response.status}).`
        );
      }
    }
    if (!response.ok) {
      throw new Error(data?.message || `Authentication request failed (${response.status}).`);
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Unable to reach the account service. Start the backend with `npm start` from the backend folder.",
        { cause: error }
      );
    }
    throw error;
  }
}

export function login(credentials) {
  return request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
}

export function signup(details) {
  return request("/auth/signup", { method: "POST", body: JSON.stringify(details) });
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}
