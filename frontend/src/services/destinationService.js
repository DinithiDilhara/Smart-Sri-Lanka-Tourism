
const API_URL = `${(import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")}/destinations`;

async function handleResponse(response) {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? "Invalid response from server"
        : `Server error (${response.status})`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed (${response.status})`
    );
  }

  return data;
}

// Public: Get all destinations
export async function getDestinations() {
  const response = await fetch(API_URL, {
    credentials: "include"
  });

  return handleResponse(response);
}

// Public: Get a destination by MongoDB ID
export async function getDestinationById(id) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(id)}`,
    { credentials: "include" }
  );

  return handleResponse(response);
}

// Admin only: Create destination
export async function createDestination(destination) {
  const response = await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(destination)
  });

  return handleResponse(response);
}

// Admin only: Update destination
export async function updateDestination(id, destination) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(destination)
    }
  );

  return handleResponse(response);
}

// Admin only: Delete destination
export async function deleteDestination(id) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "include"
    }
  );

  return handleResponse(response);
}
