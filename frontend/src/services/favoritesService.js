
const SOURCE = import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "/api";
const BASE = SOURCE.replace(/\/+$/, "");
const URL = BASE.endsWith("/api")
  ? BASE + "/favorites"
  : BASE + "/api/favorites";

const CHANGE_EVENT = "explore-world-favorites-changed";
let ids = [];
let loaded = false;
let request = null;

export function favoriteId(destination) {
  return String(destination?._id || destination?.id || "");
}

export function getFavoriteIds() {
  return [...ids];
}

function updateIds(next) {
  ids = Array.isArray(next) ? next.map(String) : [];
  loaded = true;
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return [...ids];
}

export function subscribeFavorites(callback) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

export function loadFavoriteIds() {
  if (request) return request;
  request = (async () => {
    const response = await fetch(URL, { credentials: "include" });
    if (response.status === 401) return updateIds([]);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw Error(data.message || "Unable to load favorites");
    }
    return updateIds(data.favorites);
  })().finally(() => { request = null; });
  return request;
}

export async function toggleFavorite(destination) {
  const id = favoriteId(destination);

  if (!/^[a-f\d]{24}$/i.test(id)) {
    throw Error("Destination does not have a valid MongoDB ID");
  }

  if (!loaded) await loadFavoriteIds();

  const isSaved = ids.includes(id);
  const response = await fetch(URL + "/" + encodeURIComponent(id), {
    method: isSaved ? "DELETE" : "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Error(data.message || "Unable to update favorites");
  }

  updateIds(data.favorites);
  return ids.includes(id);
}
