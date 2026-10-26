
import { useEffect, useState } from "react";
import {
  getDestinations,
  createDestination
} from "./services/destinationService";
import Homepage from "./components/Homepage";
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
    <div className="app" id="top">
      <Homepage />

      <main className="destination-library" id="destination-library">
        <section className="library-intro">
          <p className="eyebrow">Your next chapter</p>
          <h2>Explore the collection</h2>
          <p>Find a destination worth taking the long way to.</p>
        </section>

        <section className="destination-manager">
          <details>
            <summary>Add a destination to your collection</summary>

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
          </details>
        </section>

        <section className="destination-results">
          <div className="section-heading">
            <div>
              <p className="eyebrow">From the database</p>
              <h2>Tourist destinations</h2>
            </div>
            <span>{destinations.length} places</span>
          </div>

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
