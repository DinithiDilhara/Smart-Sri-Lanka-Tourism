import { useEffect, useMemo, useRef, useState } from "react";
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
  removeTripDestination,
  saveTravelIdea,
  addCustomTripStop,
  setCustomTripStopDay,
  removeCustomTripStop
} from "../services/tripsService";
import "./TripPlannerPage.css";

const emptyBudget = { accommodation: 0, transport: 0, food: 0, activities: 0 };
const defaultCalculator = {
  enabled: false,
  travelers: 1,
  rooms: 1,
  hotelPerNight: 0,
  foodPerPersonDay: 0
};

function calculateNights(start, end) {
  if (!start || !end) return null;
  const ms = Date.parse(end + "T00:00:00Z") - Date.parse(start + "T00:00:00Z");
  if (!Number.isFinite(ms) || ms < 0) return null;
  return Math.round(ms / 86400000);
}

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
  const [customStop, setCustomStop] = useState({ name: "", country: "", region: "", day: 1 });
  const handledAdd = useRef("");

  const pendingId = new URLSearchParams(location.search).get("add");
  const pending = destinations.find((item) => item._id === pendingId);
  const selected = trips.find((trip) => trip._id === selectedTripId) || trips[0] || null;

  const activeDestinationId = destinationId;

  const groupedItems = useMemo(() => {
    if (!selected) return [];
    const grouped = new Map();
    for (const item of selected.items || []) {
      if (!item.destination) continue;
      if (!grouped.has(item.day)) grouped.set(item.day, []);
      grouped.get(item.day).push(item.destination);
    }
    for (const stop of selected.customStops || []) {
      if (!grouped.has(stop.day)) grouped.set(stop.day, []);
      grouped.get(stop.day).push({
        _id: stop._id,
        name: stop.name,
        country: stop.country,
        district: stop.region,
        isCustom: true
      });
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

  // Every Add to plan click is persisted immediately in the user's MongoDB draft.
  // Existing draft destinations remain; clicking a second country never replaces them.
  useEffect(() => {
    if (!pendingId || loading || handledAdd.current === pendingId) return;
    handledAdd.current = pendingId;
    async function addIdea() {
      setBusy(true);
      setError("");
      try {
        const trip = await saveTravelIdea(pendingId);
        await refresh(trip._id);
        setNotice("Destination saved to My Travel Ideas. Keep exploring or plan your trip later.");
        navigate("/my-trips", { replace: true });
      } catch (err) {
        setError(err.message || "Unable to save destination to travel ideas.");
      } finally {
        setBusy(false);
      }
    }
    addIdea();
  }, [pendingId, loading, navigate]);

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
      budget: { ...emptyBudget, ...(selected.budget || {}) },
      budgetCalculator: { ...defaultCalculator, ...(selected.budgetCalculator || {}) }
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
      await refresh(trip._id);
      setNewTrip({ name: "", startDate: "", endDate: "" });
    }, "Trip created successfully.");
  }

  async function handleAdd(event) {
    event.preventDefault();
    if (!selected || !activeDestinationId) return;
    await perform(async () => {
      await addTripDestination(selected._id, activeDestinationId, Number(day));
      await refresh(selected._id);
      setDestinationId("");
    }, "Destination added to your trip.");
  }

  async function handleAddCustom(event) {
    event.preventDefault();
    if (!selected) return;
    await perform(async () => {
      await addCustomTripStop(selected._id, customStop);
      await refresh(selected._id);
      setCustomStop({ name: "", country: "", region: "", day: 1 });
    }, "Your personal place was added to the trip.");
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!selected || !details) return;
    if (details.budgetCalculator.enabled && calculateNights(details.startDate, details.endDate) === null) {
      setError("Choose a valid start and end date before calculating your budget.");
      return;
    }
    await perform(async () => {
      const payload = { ...details, budget: estimatedBudget };
      await updateTrip(selected._id, payload);
      await refresh(selected._id);
    }, "Trip details and budget saved to MongoDB.");
  }

  async function handleMove(destination, nextDay) {
    if (!selected) return;
    await perform(async () => {
      if (destination.isCustom) {
        await setCustomTripStopDay(selected._id, destination._id, Number(nextDay));
      } else {
        await setDestinationDay(selected._id, destination._id, Number(nextDay));
      }
      await refresh(selected._id);
    }, "Itinerary updated.");
  }

  async function handleRemove(destination) {
    if (!selected) return;
    await perform(async () => {
      if (destination.isCustom) {
        await removeCustomTripStop(selected._id, destination._id);
      } else {
        await removeTripDestination(selected._id, destination._id);
      }
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

  const calculator = details?.budgetCalculator || defaultCalculator;
  const nights = calculateNights(details?.startDate, details?.endDate);
  const estimatedBudget = { ...emptyBudget, ...(details?.budget || {}) };
  if (calculator.enabled && nights !== null) {
    estimatedBudget.accommodation = Math.round(nights * Number(calculator.rooms) * Number(calculator.hotelPerNight) * 100) / 100;
    estimatedBudget.food = Math.round((nights + 1) * Number(calculator.travelers) * Number(calculator.foodPerPersonDay) * 100) / 100;
  }
  const totalBudget = Object.values(estimatedBudget).reduce((total, amount) => total + (Number(amount) || 0), 0);
  const hasEstimate = Object.values(estimatedBudget).some((value) => Number(value) > 0);

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
            <p>Saving this destination to your MongoDB travel-ideas draft…</p>
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
                    <strong>{trip.name}{trip.isDraft ? " · Draft" : ""}</strong>
                    <small>{(trip.items?.length || 0) + (trip.customStops?.length || 0)} places · {trip.startDate || "Dates not set"}</small>
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
                    <p>{(selected.items?.length || 0) + (selected.customStops?.length || 0)} saved places {selected.isDraft ? "· Unplanned draft" : ""}</p>
                  </div>
                  <button className="trip-danger" type="button" onClick={handleDelete} disabled={busy}>Delete trip</button>
                </section>

                <form className="trip-panel trip-form" onSubmit={handleAdd}>
                  <h2>Add a destination</h2>
                  <div className="trip-form-row">
                    <label>Destination
                      <select
                        disabled={placesLoading}
                        value={destinationId}
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

                <form className="trip-panel trip-form" onSubmit={handleAddCustom}>
                  <h2>Add any other place</h2>
                  <p className="trip-help">Can't find a place in Explore World? Add it as a personal stop in your itinerary. It stays private and does not change the public destination catalog.</p>
                  <div className="trip-form-row">
                    <label>Place name
                      <input required maxLength={120} placeholder="e.g. Universal Studios Singapore"
                        value={customStop.name} onChange={(e) => setCustomStop({ ...customStop, name: e.target.value })} />
                    </label>
                    <label>Country
                      <input required maxLength={100} placeholder="e.g. Singapore"
                        value={customStop.country} onChange={(e) => setCustomStop({ ...customStop, country: e.target.value })} />
                    </label>
                  </div>
                  <div className="trip-form-row">
                    <label>City / region (optional)
                      <input maxLength={120} placeholder="e.g. Sentosa"
                        value={customStop.region} onChange={(e) => setCustomStop({ ...customStop, region: e.target.value })} />
                    </label>
                    <label>Trip day (1–60)
                      <input type="number" required min="1" max="60"
                        value={customStop.day} onChange={(e) => setCustomStop({ ...customStop, day: e.target.value })} />
                    </label>
                  </div>
                  <button className="trip-primary" disabled={busy} type="submit">Add personal stop</button>
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
                              {place.isCustom ? <span className="trip-personal-label">Personal stop</span> : (
                                <Link to={`/destinations/${place.slug}`}>Details ↗</Link>
                              )}
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
                    <div className="trip-calculator-switch">
                      <div>
                        <strong>Automatic budget calculator</strong>
                        <p>Enter your own estimated rates; we calculate the totals. No live prices.</p>
                      </div>
                      <button
                        type="button"
                        className="trip-outline trip-calculator-toggle"
                        aria-pressed={calculator.enabled}
                        onClick={() => setDetails({
                          ...details,
                          budgetCalculator: { ...calculator, enabled: !calculator.enabled }
                        })}
                      >
                        {calculator.enabled ? "Use manual totals" : "Use automatic calculator"}
                      </button>
                    </div>
                    {calculator.enabled ? (
                      <>
                        <p className="trip-help">
                          {nights === null
                            ? "Select start and end dates to calculate the number of nights."
                            : `${nights} night${nights === 1 ? "" : "s"} · ${nights + 1} travel day${nights === 0 ? "" : "s"} (calculated from your dates).`}
                        </p>
                        <div className="trip-budget-grid">
                          {[
                            ["travelers", "Travelers", 1, 30, 1],
                            ["rooms", "Hotel rooms", 1, 20, 1],
                            ["hotelPerNight", "Hotel price per room/night (USD)", 0, 1000000, 0.01],
                            ["foodPerPersonDay", "Food per person/day (USD)", 0, 1000000, 0.01]
                          ].map(([key, label, min, max, step]) => (
                            <label key={key}>{label}
                              <input type="number" min={min} max={max} step={step} required
                                value={calculator[key]}
                                onChange={(e) => setDetails({
                                  ...details,
                                  budgetCalculator: { ...calculator, [key]: e.target.value }
                                })} />
                            </label>
                          ))}
                          {[
                            ["transport", "Total transport (USD)"],
                            ["activities", "Total activities (USD)"]
                          ].map(([key, label]) => (
                            <label key={key}>{label}
                              <input type="number" min="0" max="100000000" step="0.01"
                                value={details.budget[key]}
                                onChange={(e) => setDetails({
                                  ...details,
                                  budget: { ...details.budget, [key]: e.target.value }
                                })} />
                            </label>
                          ))}
                        </div>
                        {nights !== null && (
                          <div className="trip-budget-breakdown">
                            <span>Hotel: {nights} nights × {calculator.rooms} room(s) × ${Number(calculator.hotelPerNight || 0).toFixed(2)} = ${Number(estimatedBudget.accommodation).toFixed(2)}</span>
                            <span>Food: {nights + 1} days × {calculator.travelers} traveler(s) × ${Number(calculator.foodPerPersonDay || 0).toFixed(2)} = ${Number(estimatedBudget.food).toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="trip-help">Manual totals from your existing trip are preserved. Switch to automatic only when you want to calculate from rates.</p>
                        <div className="trip-budget-grid">
                          {Object.keys(emptyBudget).map((key) => (
                            <label key={key}>{key[0].toUpperCase() + key.slice(1)} total (USD)
                              <input type="number" min="0" max="100000000" step="0.01"
                                value={details.budget[key]}
                                onChange={(e) => setDetails({
                                  ...details,
                                  budget: { ...details.budget, [key]: e.target.value }
                                })} />
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="trip-budget-total">
                      <span>{hasEstimate ? "Estimated total" : "Budget not estimated yet"}</span>
                      <strong>{hasEstimate ? `$${totalBudget.toFixed(2)}` : "—"}</strong>
                    </div>
                    <p className="trip-help">Estimates only. Actual hotel and travel costs may vary.</p>
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
