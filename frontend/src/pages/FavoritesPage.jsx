import { Link } from "react-router-dom";
import SiteNavbar from "../components/SiteNavbar";

export default function FavoritesPage() {
  return (
    <main className="app-shell">
      <SiteNavbar />
      <section className="site-placeholder-page">
        <div className="site-placeholder-content">
          <p className="kicker">Your travel collection</p>
          <h1>My Favorites</h1>
          <p>Keep the destinations you love in one place.</p>
          <div className="site-placeholder-panel">
            <h2>Your saved places will appear here.</h2>
            <p>The navigation is ready. Saving destinations to your account will be added in the next development step. No favorites have been saved by this page yet.</p>
          </div>
          <div className="site-placeholder-actions">
            <Link to="/explore">Explore countries</Link>
            <Link to="/destinations">Browse all destinations</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
