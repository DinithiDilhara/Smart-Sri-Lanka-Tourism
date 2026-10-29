const source =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const base = source.replace(/\/+$/, "");
const url = base.endsWith("/api") ? `${base}/trips` : `${base}/api/trips`;

async function request(path = "", options = {}) {
  let response;
  try {
    response = await fetch(url + path, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  } catch {
    throw new Error("Unable to connect to the backend. Check that it is running.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status}).`);
  }
  return data;
}

export const getTrips = () => request().then((data) => data.trips || []);
export const createTrip = (data) =>
  request("", { method: "POST", body: JSON.stringify(data) }).then((result) => result.trip);
export const updateTrip = (id, data) =>
  request(`/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) })
    .then((result) => result.trip);
export const deleteTrip = (id) =>
  request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
export const addTripDestination = (id, destinationId, day) =>
  request(`/${encodeURIComponent(id)}/destinations`, {
    method: "POST",
    body: JSON.stringify({ destinationId, day })
  }).then((result) => result.trip);
export const setDestinationDay = (id, destinationId, day) =>
  request(`/${encodeURIComponent(id)}/destinations/${encodeURIComponent(destinationId)}`, {
    method: "PATCH",
    body: JSON.stringify({ day })
  }).then((result) => result.trip);
export const removeTripDestination = (id, destinationId) =>
  request(`/${encodeURIComponent(id)}/destinations/${encodeURIComponent(destinationId)}`, {
    method: "DELETE"
  }).then((result) => result.trip);

export const saveTravelIdea = (destinationId) =>
  request("/ideas", {
    method: "POST",
    body: JSON.stringify({ destinationId })
  }).then((result) => result.trip);

export const addCustomTripStop = (tripId, data) =>
  request(`/${encodeURIComponent(tripId)}/custom-stops`, {
    method: "POST",
    body: JSON.stringify(data)
  }).then((result) => result.trip);

export const setCustomTripStopDay = (tripId, stopId, day) =>
  request(`/${encodeURIComponent(tripId)}/custom-stops/${encodeURIComponent(stopId)}`, {
    method: "PATCH",
    body: JSON.stringify({ day })
  }).then((result) => result.trip);

export const removeCustomTripStop = (tripId, stopId) =>
  request(`/${encodeURIComponent(tripId)}/custom-stops/${encodeURIComponent(stopId)}`, {
    method: "DELETE"
  }).then((result) => result.trip);
