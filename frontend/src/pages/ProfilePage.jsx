import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import SiteNavbar from "../components/SiteNavbar";

export default function ProfilePage() {
  const [state, setState] = useState({ loading: true, user: null, error: "" });

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then(({ user }) => {
        if (active) setState({ loading: false, user: user || null, error: "" });
      })
      .catch(() => {
        if (active) setState({ loading: false, user: null, error: "Unable to retrieve profile details." });
      });
    return () => { active = false; };
  }, []);

  return (
    <main className="app-shell">
      <SiteNavbar />
      <section className="site-placeholder-page">
        <div className="site-placeholder-content">
          <p className="kicker">Account details</p>
          <h1>My Profile</h1>
          <p>Review the information associated with your Explore World account.</p>
          <div className="site-placeholder-panel">
            {state.loading ? <p role="status">Loading profile…</p> : state.error ? (
              <p role="alert" className="site-profile-message">{state.error}</p>
            ) : state.user ? (
              <dl className="site-profile-data">
                <div><dt>Name</dt><dd>{state.user.name || "Not provided"}</dd></div>
                <div><dt>Email</dt><dd>{state.user.email || "Not provided"}</dd></div>
                <div><dt>Account type</dt><dd>{state.user.role === "admin" ? "Admin" : "Traveler"}</dd></div>
              </dl>
            ) : <p>Please sign in again to view your profile.</p>}
          </div>
          <div className="site-placeholder-actions">
            <Link to="/my-trips">My Trips</Link>
            <Link to="/favorites">My Favorites</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
