
import { useEffect, useState } from "react";
import {
  getDestinations,
  createDestination
} from "./services/destinationService";
import "./App.css";

const initialForm = {
  name: "",
  district: "",
  category: "",
  description: "",
  imageUrl: ""
};

function App() {
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDestinations() {
      try {
        const data = await getDestinations();
        setDestinations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDestinations();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const created = await createDestination(form);

      setDestinations((previous) => [created, ...previous]);
      setForm(initialForm);
      setMessage("Destination added successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Explore Sri Lanka</h1>
        <p>Discover the beauty of Sri Lanka</p>
      </header>

      <main>
        <section>
          <h2>Add New Destination</h2>

          <form className="destination-form" onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="Destination name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="district"
              placeholder="District"
              value={form.district}
              onChange={handleChange}
              required
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              <option value="Nature">Nature</option>
              <option value="Historical">Historical</option>
              <option value="Beach">Beach</option>
              <option value="Adventure">Adventure</option>
              <option value="Cultural">Cultural</option>
            </select>

            <textarea
              name="description"
              placeholder="Destination description"
              value={form.description}
              onChange={handleChange}
              required
            />

            <input
              name="imageUrl"
              placeholder="Image URL (optional)"
              value={form.imageUrl}
              onChange={handleChange}
            />

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add Destination"}
            </button>
          </form>

          {message && <p className="success-message" role="status">{message}</p>}
          {error && <p className="error-message" role="alert">{error}</p>}
        </section>

        <section>
          <h2>Tourist Destinations</h2>

          {loading && <p>Loading destinations...</p>}

          {!loading && destinations.length === 0 && (
            <p>No destinations available.</p>
          )}

          <div className="destination-grid">
            {destinations.map((destination) => (
              <article className="destination-card" key={destination._id}>
                {destination.imageUrl && (
                  <img
                    src={destination.imageUrl}
                    alt={destination.name}
                  />
                )}

                <h3>{destination.name}</h3>
                <p><strong>District:</strong> {destination.district}</p>
                <p><strong>Category:</strong> {destination.category}</p>
                <p>{destination.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
