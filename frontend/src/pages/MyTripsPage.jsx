import { Link } from "react-router-dom";
import SiteNavbar from "../components/SiteNavbar";

export default function MyTripsPage() {
  return (
    <main className="app-shell">
      <SiteNavbar />
      <section className="site-placeholder-page">
        <div className="site-placeholder-content">
          <p className="kicker">Plan your next journey</p>
          <h1>My Trips</h1>
          <p>Your future space for organizing travel dates, destinations, hotel choices, and a trip budget.</p>
          <div className="site-placeholder-panel">
            <h2>Trip planning is the next feature to build.</h2>
            <p>For now, you can explore destinations and browse the existing hotel listings. Creating or saving itineraries is not enabled yet.</p>
          </div>
          <div className="site-placeholder-actions">
            <Link to="/explore">Choose destinations</Link>
            <Link to="/hotels">Browse hotels</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
