import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/authService";
import BrandLogo from "./BrandLogo";

const PUBLIC_LINKS = [
  { label: "Home", path: "/" },
  { label: "Explore", path: "/explore" },
  { label: "Favorites", path: "/favorites" },
  { label: "My Trips", path: "/my-trips" }
];

function ProfileIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20c.4-4.1 3-6.5 7.5-6.5s7.1 2.4 7.5 6.5" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {open ? (
        <path d="M5 5l14 14M19 5L5 19" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export default function SiteNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser || null);
      })
      .catch(() => {
        if (active) setUser(null);
      });
    return () => { active = false; };
  }, [location.pathname]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileOpen]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      setUser(null);
      setProfileOpen(false);
      navigate("/login");
    } catch {
      setLoggingOut(false);
      // Keep the current page if sign-out fails.
      window.alert("Unable to log out. Please try again.");
    }
  }

  const inExplore = ["/explore", "/countries", "/destinations"].some((prefix) =>
    location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
  );

  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <BrandLogo />

        <nav
          className={`site-nav-links${mobileOpen ? " site-nav-links-open" : ""}`}
          aria-label="Main navigation"
          id="site-nav-links"
        >
          {PUBLIC_LINKS.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `site-nav-link${(path === "/explore" ? inExplore : isActive) ? " active" : ""}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="site-nav-actions">
          <div className="site-profile" ref={profileRef}>
            <button
              className="site-profile-button"
              type="button"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-controls="site-profile-menu"
              onClick={() => setProfileOpen((previous) => !previous)}
            >
              <ProfileIcon />
            </button>
            {profileOpen && (
              <div className="site-profile-menu" id="site-profile-menu">
                {user ? (
                  <>
                    <div className="site-profile-summary">
                      <strong>{user.name || "Traveler"}</strong>
                      <small>{user.email || "Signed in"}</small>
                    </div>
                    <Link to="/profile" onClick={() => setProfileOpen(false)}>My Profile</Link>
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)}>Admin Dashboard</Link>
                    )}
                    <button type="button" onClick={handleLogout} disabled={loggingOut}>
                      {loggingOut ? "Logging out…" : "Log Out"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="site-profile-summary">
                      <strong>Welcome to Explore World</strong>
                      <small>Sign in to plan your journeys.</small>
                    </div>
                    <Link to="/login" onClick={() => setProfileOpen(false)}>Log In</Link>
                    <Link to="/signup" onClick={() => setProfileOpen(false)}>Create Account</Link>
                  </>
                )}
              </div>
            )}
          </div>
          <button
            className="site-mobile-toggle"
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-controls="site-nav-links"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((previous) => !previous)}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>
    </header>
  );
}
