import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SiteNavbar from "../components/SiteNavbar";
import { useDestinations } from "../hooks/useDestinations";
import {
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  addTripDestination,
  setDestinationDay,
  removeTripDestination
} from "../services/tripsService";
import "./TripPlannerPage.css";

const emptyBudget = { accommodation: 0, transport: 0, food: 0, activities: 0 };

function MapLink({ destination }) {
  const query = [destination.name, destination.district, destination.country]
    .filter(Boolean).join(", ");
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      View map ↗
    </a>
  );
}

export default function TripPlannerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { destinations, loading: placesLoading, error: placesError } = useDestinations();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedTripId, setSelectedTripId] = useState("");
  const [day, setDay] = useState(1);
  const [destinationId, setDestinationId] = useState("");
  const [newTrip, setNewTrip] = useState({ name: "", startDate: "", endDate: "" });
  const [details, setDetails] = useState(null);

  const pendingId = new URLSearchParams(location.search).get("add");
  const pending = destinations.find((item) => item._id === pendingId);
  const selected = trips.find((trip) => trip._id === selectedTripId) || trips[0] || null;

  const activeDestinationId = pendingId || destinationId;

  const groupedItems = useMemo(() => {
    if (!selected) return [];
    const grouped = new Map();
    for (const item of selected.items || []) {
      if (!item.destination) continue;
      if (!grouped.has(item.day)) grouped.set(item.day, []);
      grouped.get(item.day).push(item.destination);
    }
    return [...grouped.entries()].sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [selected]);

  useEffect(() => {
    let active = true;
    getTrips()
      .then((data) => { if (active) setTrips(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selected) {
      setDetails(null);
      return;
    }
    setDetails({
      name: selected.name || "",
      startDate: selected.startDate || "",
      endDate: selected.endDate || "",
      hotelName: selected.hotelName || "",
      budget: { ...emptyBudget, ...(selected.budget || {}) }
    });
  }, [selected?._id, selected?.updatedAt]);

  async function perform(action, success) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(success);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function refresh(selectId) {
    const data = await getTrips();
    setTrips(data);
    if (selectId) setSelectedTripId(selectId);
  }

  async function handleCreate(event) {
    event.preventDefault();
    await perform(async () => {
      const trip = await createTrip(newTrip);
      if (pendingId) {
        try {
          await addTripDestination(trip._id, pendingId, 1);
        } catch (err) {
          await refresh(trip._id);
          throw new Error(`Trip created, but destination could not be added: ${err.message}`);
        }
        navigate("/my-trips", { replace: true });
      }
      await refresh(trip._id);
      setNewTrip({ name: "", startDate: "", endDate: "" });
    }, pendingId ? "Trip created and destination added." : "Trip created successfully.");
  }

  async function handleAdd(event) {
    event.preventDefault();
    if (!selected || !activeDestinationId) return;
    await perform(async () => {
      await addTripDestination(selected._id, activeDestinationId, Number(day));
      await refresh(selected._id);
      setDestinationId("");
      if (pendingId) navigate("/my-trips", { replace: true });
    }, "Destination added to your trip.");
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!selected || !details) return;
    await perform(async () => {
      await updateTrip(selected._id, details);
      await refresh(selected._id);
    }, "Trip details saved to MongoDB.");
  }

  async function handleMove(destination, nextDay) {
    if (!selected) return;
    await perform(async () => {
      await setDestinationDay(selected._id, destination._id, Number(nextDay));
      await refresh(selected._id);
    }, "Itinerary updated.");
  }

  async function handleRemove(destination) {
    if (!selected) return;
    await perform(async () => {
      await removeTripDestination(selected._id, destination._id);
      await refresh(selected._id);
    }, "Destination removed from your trip.");
  }

  async function handleDelete() {
    if (!selected || !window.confirm(`Delete "${selected.name}" and its itinerary?`)) return;
    await perform(async () => {
      await deleteTrip(selected._id);
      setSelectedTripId("");
      await refresh();
    }, "Trip deleted.");
  }

  const totalBudget = Object.values(details?.budget || emptyBudget)
    .reduce((total, amount) => total + (Number(amount) || 0), 0);

  return (
    <main className="trip-page app-shell">
      <SiteNavbar />
      <div className="trip-wrap">
        <header className="trip-header">
          <div>
            <p className="trip-eyebrow">MAKE EVERY JOURNEY COUNT</p>
            <h1>My <em>Trips.</em></h1>
            <p>Save destinations, organize your days, choose a stay and estimate your budget.</p>
          </div>
          <Link className="trip-outline" to="/explore">Explore more places ↗</Link>
        </header>

        {error && <div className="trip-alert" role="alert">{error}</div>}
        {notice && <div className="trip-success" role="status">{notice}</div>}

        {pendingId && (
          <section className="trip-banner">
            <span>ADD TO YOUR JOURNEY</span>
            <strong>{pending ? `${pending.name}, ${pending.country}` : placesLoading ? "Loading destination…" : "Selected destination"}</strong>
            <p>Choose one of your trips below, or create a new trip first.</p>
          </section>
        )}

        <section className="trip-layout">
          <aside className="trip-side">
            <div className="trip-panel">
              <h2>Your trips</h2>
              {loading && <p>Loading your trips…</p>}
              {!loading && trips.length === 0 && <p>No trips yet. Create your first one below.</p>}
              <div className="trip-list">
                {trips.map((trip) => (
                  <button
                    type="button"
                    key={trip._id}
                    className={selected?._id === trip._id ? "trip-list-item is-active" : "trip-list-item"}
                    onClick={() => { setSelectedTripId(trip._id); setError(""); }}
                  >
                    <strong>{trip.name}</strong>
                    <small>{trip.items?.length || 0} places · {trip.startDate || "Dates not set"}</small>
                  </button>
                ))}
              </div>
            </div>

            <form className="trip-panel trip-form" onSubmit={handleCreate}>
              <h2>Create a new trip</h2>
              <label>Trip name
                <input required maxLength={100} placeholder="Sri Lanka adventure"
                  value={newTrip.name} onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })} />
              </label>
              <label>Start date (optional)
                <input type="date" value={newTrip.startDate}
                  onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })} />
              </label>
              <label>End date (optional)
                <input type="date" min={newTrip.startDate || undefined} value={newTrip.endDate}
                  onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })} />
              </label>
              <button className="trip-primary" type="submit" disabled={busy || loading}>Create trip</button>
            </form>
          </aside>

          <section className="trip-main">
            {!selected && !loading && (
              <div className="trip-panel trip-empty">
                <h2>Your adventure starts here.</h2>
                <p>Give your trip a name. Then add places from any country in Explore World.</p>
              </div>
            )}

            {selected && (
              <>
                <section className="trip-panel trip-selected-heading">
                  <div>
                    <p className="trip-eyebrow">CURRENT ITINERARY</p>
                    <h2>{selected.name}</h2>
                    <p>{(selected.items || []).length} saved destinations</p>
                  </div>
                  <button className="trip-danger" type="button" onClick={handleDelete} disabled={busy}>Delete trip</button>
                </section>

                <form className="trip-panel trip-form" onSubmit={handleAdd}>
                  <h2>Add a destination</h2>
                  <div className="trip-form-row">
                    <label>Destination
                      <select
                        disabled={Boolean(pendingId) || placesLoading}
                        value={pendingId || destinationId}
                        onChange={(e) => setDestinationId(e.target.value)}
                        required
                      >
                        <option value="">Choose a destination</option>
                        {destinations.map((place) => (
                          <option key={place._id} value={place._id}>{place.name} · {place.country}</option>
                        ))}
                      </select>
                    </label>
                    <label>Trip day (1–60)
                      <input type="number" min="1" max="60" required value={day}
                        onChange={(e) => setDay(e.target.value)} />
                    </label>
                  </div>
                  <button className="trip-primary" type="submit"
                    disabled={busy || placesLoading || !activeDestinationId}>
                    Add destination to trip
                  </button>
                  {placesError && <p role="alert">Unable to load destination options: {placesError}</p>}
                </form>

                <section className="trip-panel">
                  <h2>Day-by-day itinerary</h2>
                  {groupedItems.length === 0 && <p>No destinations added yet. Start with one place above.</p>}
                  {groupedItems.map(([dayNumber, places]) => (
                    <div className="trip-day" key={dayNumber}>
                      <h3>Day {dayNumber}</h3>
                      {places.map((place) => (
                        <article className="trip-place" key={place._id}>
                          {place.imageUrl && <img src={place.imageUrl} alt="" loading="lazy" />}
                          <div className="trip-place-description">
                            <strong>{place.name}</strong>
                            <small>{place.district}, {place.country}</small>
                            <div className="trip-place-links">
                              <Link to={`/destinations/${place.slug}`}>Details ↗</Link>
                              <MapLink destination={place} />
                            </div>
                          </div>
                          <div className="trip-place-actions">
                            <label>Day
                              <select value={dayNumber} disabled={busy}
                                onChange={(e) => handleMove(place, e.target.value)}>
                                {Array.from({ length: 60 }, (_, n) => n + 1).map((n) =>
                                  <option key={n} value={n}>{n}</option>
                                )}
                              </select>
                            </label>
                            <button type="button" onClick={() => handleRemove(place)} disabled={busy}>Remove</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ))}
                </section>

                {details && (
                  <form className="trip-panel trip-form" onSubmit={handleSave}>
                    <h2>Hotel &amp; travel budget</h2>
                    <p className="trip-help">Enter your own estimates. This is not a live booking or pricing service.</p>
                    <div className="trip-form-row">
                      <label>Trip name
                        <input value={details.name} required maxLength={100}
                          onChange={(e) => setDetails({ ...details, name: e.target.value })} />
                      </label>
                      <label>Hotel or accommodation
                        <input value={details.hotelName} maxLength={150} placeholder="Hotel name (optional)"
                          onChange={(e) => setDetails({ ...details, hotelName: e.target.value })} />
                      </label>
                    </div>
                    <div className="trip-form-row">
                      <label>Start date
                        <input type="date" value={details.startDate}
                          onChange={(e) => setDetails({ ...details, startDate: e.target.value })} />
                      </label>
                      <label>End date
                        <input type="date" value={details.endDate} min={details.startDate || undefined}
                          onChange={(e) => setDetails({ ...details, endDate: e.target.value })} />
                      </label>
                    </div>
                    <div className="trip-budget-grid">
                      {Object.keys(emptyBudget).map((key) => (
                        <label key={key}>{key[0].toUpperCase() + key.slice(1)} (USD)
                          <input type="number" min="0" step="0.01"
                            value={details.budget[key]}
                            onChange={(e) => setDetails({
                              ...details,
                              budget: { ...details.budget, [key]: e.target.value }
                            })} />
                        </label>
                      ))}
                    </div>
                    <div className="trip-budget-total"><span>Estimated total</span><strong>${totalBudget.toFixed(2)}</strong></div>
                    <div className="trip-form-footer">
                      <Link to="/hotels">Browse hotel suggestions ↗</Link>
                      <button className="trip-primary" disabled={busy} type="submit">Save trip details</button>
                    </div>
                  </form>
                )}
              </>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
