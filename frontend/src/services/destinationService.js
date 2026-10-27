
const API_URL = `${import.meta.env.VITE_API_URL || "/api"}/destinations`;

export async function getDestinations() {
  const response = await fetch(API_URL, { credentials: "include" });

  if (!response.ok) {
    throw new Error("Failed to fetch destinations");
  }

  return response.json();
}

export async function createDestination(destination) {
  const response = await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(destination)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add destination");
  }

  return data;
}
