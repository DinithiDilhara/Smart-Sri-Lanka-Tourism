
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteNavbar from "../components/SiteNavbar";
import ImagePlaceholder from "../components/ImagePlaceholder";
import { useDestinations } from "../hooks/useDestinations";
import {
  favoriteId,
  getFavoriteIds,
  toggleFavorite,
  loadFavoriteIds,
  subscribeFavorites
} from "../services/favoritesService";

export default function FavoritesPage() {
  const { destinations, loading, error } = useDestinations();
  const [savedIds, setSavedIds] = useState(getFavoriteIds);

  useEffect(() => {
    loadFavoriteIds().catch((error) => window.alert(error.message));
    return subscribeFavorites(() => {
      setSavedIds(getFavoriteIds());
    });
  }, []);

  const favorites = destinations.filter((destination) =>
    savedIds.includes(favoriteId(destination))
  );

  return (
    <main className="app-shell">
      <SiteNavbar />

      <section className="page-heading">
        <p className="kicker">Your travel collection</p>
        <h1>My <em>Favorites.</em></h1>
        <p>All the places you love, saved in one place.</p>
      </section>

      <section className="content-width country-results">
        {loading && <p>Loading your favorites...</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && favorites.length === 0 && (
          <div className="hotel-empty">
            <h2>No favorites yet</h2>
            <p>Explore destinations and tap a heart to save a place.</p>
            <Link className="outline-button" to="/destinations">
              Explore destinations →
            </Link>
          </div>
        )}

        <div className="destination-grid">
          {favorites.map((destination) => (
            <article
              className="destination-tile"
              key={favoriteId(destination)}
            >
              <Link
                className="destination-main-link"
                to={`/destinations/${destination.id}`}
              >
                <div className="tile-image">
                  {destination.image ? (
                    <img
                      src={destination.image}
                      alt={destination.name}
                    />
                  ) : (
                    <ImagePlaceholder />
                  )}
                </div>

                <div className="tile-copy">
                  <span>
                    {destination.country} · {destination.category}
                  </span>
                  <h3>{destination.name}</h3>
                  <small>
                    View destination <b>→</b>
                  </small>
                </div>
              </Link>

              <button
                type="button"
                className="favorite-heart is-saved"
                onClick={() => toggleFavorite(destination).catch((error) => window.alert(error.message))}
                aria-label={`Remove ${destination.name} from favorites`}
                title="Remove from Favorites"
              >
                ♥
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
