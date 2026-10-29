import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  createDestination,
  deleteDestination,
  getDestinations,
  updateDestination
} from "../services/destinationService";
import { logout } from "../services/authService";
import BrandLogo from "./BrandLogo";
import "./AdminDashboard.css";

// Keep these fields in sync with the EXISTING Destination model / API.
// Image upload and multiple-image galleries are intentionally not simulated:
// the current application stores a single imageUrl.
const EMPTY_FORM = {
  name: "",
  country: "",
  district: "",
  category: "",
  description: "",
  imageUrl: ""
};

const COUNTRY_SUGGESTIONS = ["Sri Lanka", "India", "Nepal", "Indonesia", "Thailand"];
const CATEGORY_SUGGESTIONS = ["Nature", "Heritage", "Adventure", "Beach", "Culture", "Wildlife", "City"];
const PAGE_SIZE = 6;

const ICON_PATHS = {
  dashboard: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  pin: "M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11zM12 12a2.3 2.3 0 1 0 0-4.6A2.3 2.3 0 0 0 12 12z",
  plus: "M12 5v14M5 12h14",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "M19 12H5m6-6-6 6 6 6",
  edit: "m4 16-.8 4 4-.8L19 7.4a2.1 2.1 0 0 0-3-3L4 16z",
  trash: "M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V4h6v3",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm6-2 4 4",
  image: "M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4M8 8h.01",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18",
  location: "M12 3a7 7 0 0 0-7 7c0 5 7 11 7 11s7-6 7-11a7 7 0 0 0-7-7zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  chevronLeft: "m15 18-6-6 6-6",
  chevronRight: "m9 18 6-6-6-6",
  calendar: "M4 6h16v15H4zM8 3v6M16 3v6M4 11h16",
  refresh: "M20 7v5h-5M4 17v-5h5M5.5 9A7 7 0 0 1 18 7l2 5M4 12l2 5a7 7 0 0 0 12.5-2",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M5 5l14 14M19 5 5 19",
  logout: "M10 4H5v16h5M14 8l4 4-4 4M18 12H9",
  check: "M4 12l5 5L20 6"
};

function AdminIcon({ name, className = "" }) {
  return (
    <svg aria-hidden="true" focusable="false" className={`admin-icon ${className}`} viewBox="0 0 24 24">
      <path d={ICON_PATHS[name] || ICON_PATHS.pin} />
    </svg>
  );
}

function DestinationImage({ url, alt, className = "" }) {
  const [failedUrl, setFailedUrl] = useState("");

  if (!url || failedUrl === url) {
    return (
      <div className={`admin-image-placeholder ${className}`} role="img" aria-label={alt || "No destination photo"}>
        <AdminIcon name="image" />
      </div>
    );
  }
  return <img className={className} src={url} alt={alt} loading="lazy" onError={() => setFailedUrl(url)} />;
}

function formatDate(dateString) {
  if (!dateString) return "Not available";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function AdminSidebar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  }

  return (
    <aside className={`admin-panel-sidebar ${menuOpen ? "admin-sidebar-open" : ""}`}>
      <div className="admin-sidebar-brand-row">
        <div className="admin-panel-brand"><BrandLogo to="/admin" onClick={() => setMenuOpen(false)} /></div>
        <button type="button" className="admin-mobile-menu" aria-label={menuOpen ? "Close admin menu" : "Open admin menu"}
          aria-controls="explore-admin-links" aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>
          <AdminIcon name={menuOpen ? "close" : "menu"} />
        </button>
      </div>
      <div className="admin-sidebar-body" id="explore-admin-links">
        <p className="admin-panel-label">Workspace</p>
        <nav aria-label="Admin navigation" className="admin-panel-nav">
          <NavLink end to="/admin" onClick={() => setMenuOpen(false)}><AdminIcon name="dashboard" />Dashboard</NavLink>
          <NavLink to="/admin/destinations" onClick={() => setMenuOpen(false)}><AdminIcon name="pin" />Manage Destinations</NavLink>
        </nav>
        <div className="admin-profile-card">
          <div className="admin-profile-avatar">A</div>
          <div><strong>Admin</strong><span>Operations</span></div>
        </div>
        <div className="admin-sidebar-actions">
          <button type="button" className="admin-logout-button" onClick={handleLogout}>
            <AdminIcon name="logout" /> Log out
          </button>
          <Link className="admin-panel-public-link" to="/">View public site <AdminIcon name="arrow" /></Link>
        </div>
      </div>
    </aside>
  );
}

function EmptyDestinations({ onCreate, message = "Your destination library is waiting for its first place." }) {
  return (
    <div className="admin-empty-state">
      <span className="admin-empty-illustration"><AdminIcon name="pin" /></span>
      <h3>No destinations yet</h3>
      <p>{message}</p>
      <button className="admin-primary-button" type="button" onClick={onCreate}><AdminIcon name="plus" />Create destination</button>
    </div>
  );
}

function DashboardOverview({ rows, loading, onCreate, onEdit, onView }) {
  const recent = useMemo(() => [...rows].sort((a, b) => {
    const aTime = Date.parse(a.createdAt || "") || 0;
    const bTime = Date.parse(b.createdAt || "") || 0;
    return bTime - aTime;
  }).slice(0, 3), [rows]);
  const totalCountries = new Set(rows.map((item) => item.country?.trim()).filter(Boolean)).size;
  const coverImages = rows.filter((item) => Boolean(item.imageUrl?.trim())).length;

  return (
    <>
      <section className="admin-dashboard-hero">
        <div className="admin-hero-content">
          <p className="admin-panel-eyebrow">Good to see you</p>
          <h1>Dashboard</h1>
          <p>Manage travel destinations and inspire the next great journey.</p>
        </div>
        <div className="admin-hero-actions">
          <span className="admin-header-profile"><span className="admin-header-avatar">A</span> Admin</span>
          <button className="admin-primary-button" type="button" onClick={onCreate}><AdminIcon name="plus" />Add destination</button>
        </div>
      </section>

      <div className="admin-stat-grid">
        <article className="admin-stat-card"><span className="admin-stat-icon"><AdminIcon name="pin" /></span><div><p>Total destinations</p><strong>{loading ? "—" : rows.length}</strong><small>Places in your collection</small></div></article>
        <article className="admin-stat-card"><span className="admin-stat-icon"><AdminIcon name="globe" /></span><div><p>Countries covered</p><strong>{loading ? "—" : totalCountries}</strong><small>Different countries</small></div></article>
        <article className="admin-stat-card"><span className="admin-stat-icon"><AdminIcon name="image" /></span><div><p>Cover images</p><strong>{loading ? "—" : coverImages}</strong><small>Destinations with photos</small></div></article>
      </div>

      <section className="admin-surface-card admin-recent-card">
        <div className="admin-section-heading">
          <div><p className="admin-panel-eyebrow">Content overview</p><h2>Recent destinations</h2></div>
          <Link to="/admin/destinations" className="admin-text-link">View all <AdminIcon name="arrow" /></Link>
        </div>
        {loading ? <p className="admin-muted">Loading destinations…</p> : recent.length === 0 ? <EmptyDestinations onCreate={onCreate} /> : (
          <div className="admin-recent-grid">
            {recent.map((item) => (
              <article className="admin-recent-tile" key={item._id}>
                <button type="button" className="admin-recent-image-button" onClick={() => onView(item._id)} aria-label={`View ${item.name}`}>
                  <DestinationImage className="admin-recent-photo" url={item.imageUrl} alt={item.name} />
                </button>
                <div className="admin-recent-tile-content">
                  <div><strong>{item.name}</strong><span>{item.country}</span></div>
                  <button type="button" className="admin-icon-button" title={`Edit ${item.name}`} aria-label={`Edit ${item.name}`} onClick={() => onEdit(item._id)}><AdminIcon name="edit" /></button>
                </div>
                <div className="admin-recent-tile-footer"><span className="admin-saved-badge"><AdminIcon name="check" />Saved</span><button type="button" onClick={() => onView(item._id)}>View details <AdminIcon name="arrow" /></button></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function ManageDestinations({ rows, loading, onCreate, onEdit, onView, onDelete, onRefresh }) {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [page, setPage] = useState(1);
  const countries = useMemo(() => [...new Set(rows.map((row) => row.country).filter(Boolean))].sort(), [rows]);
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    const matches = rows.filter((row) => {
      const content = [row.name, row.country, row.district, row.category]
        .filter(Boolean).join(" ").toLowerCase();

      return (!query || content.includes(query)) &&
        (!country || row.country === country);
    });

    return matches.sort((a, b) => {
      const nameComparison = String(a.name || "").localeCompare(
        String(b.name || ""), undefined, { sensitivity: "base" }
      );

      if (sortOrder === "name-desc") return -nameComparison;
      if (sortOrder === "newest")
        return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
      if (sortOrder === "oldest")
        return (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0);

      return nameComparison;
    });
  }, [rows, country, search, sortOrder]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function setSearchAndReset(value) { setSearch(value); setPage(1); }
  function setCountryAndReset(value) { setCountry(value); setPage(1); }

  return (
    <>
      <div className="admin-page-heading">
        <div><p className="admin-panel-eyebrow">Destinations</p><h1>Manage Destinations</h1><p>View, edit, or delete travel destinations.</p></div>
        <button className="admin-primary-button" type="button" onClick={onCreate}><AdminIcon name="plus" />Add destination</button>
      </div>
      <section className="admin-surface-card admin-manage-card">
        <div className="admin-toolbar">
          <label className="admin-search-box"><AdminIcon name="search" /><span className="admin-sr-only">Search destinations</span><input type="search" placeholder="Search destinations…" value={search} onChange={(event) => setSearchAndReset(event.target.value)} /></label>
          <label className="admin-filter-box"><span className="admin-sr-only">Filter by country</span><select value={country} onChange={(event) => setCountryAndReset(event.target.value)}><option value="">All countries</option>{countries.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="admin-filter-box">
            <span className="admin-sr-only">Sort destinations</span>
            <select aria-label="Sort destinations" value={sortOrder} onChange={(event) => { setSortOrder(event.target.value); setPage(1); }}>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <button type="button" className="admin-secondary-button admin-refresh-button" onClick={onRefresh} title="Reload destinations"><AdminIcon name="refresh" /><span>Refresh</span></button>
        </div>
        {loading ? <p className="admin-muted">Loading destinations…</p> : rows.length === 0 ? <EmptyDestinations onCreate={onCreate} /> : filtered.length === 0 ? (
          <div className="admin-empty-state"><span className="admin-empty-illustration"><AdminIcon name="search" /></span><h3>No matching destinations</h3><p>Try another name or country.</p><button className="admin-secondary-button" type="button" onClick={() => { setSearchAndReset(""); setCountryAndReset(""); }}>Clear filters</button></div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-destinations-table">
                <thead><tr><th scope="col">#</th><th scope="col">Image</th><th scope="col">Destination</th><th scope="col">Country</th><th scope="col">Category</th><th scope="col">Actions</th></tr></thead>
                <tbody>{pageRows.map((row, index) => (
                  <tr key={row._id}>
                    <td className="admin-table-count">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                    <td><DestinationImage className="admin-table-thumb" url={row.imageUrl} alt="" /></td>
                    <td><button type="button" className="admin-table-name" onClick={() => onView(row._id)}>{row.name}</button><span className="admin-table-subtitle">{row.district || ""}</span></td>
                    <td>{row.country}</td><td><span className="admin-category-badge">{row.category}</span></td>
                    <td><div className="admin-table-actions">
                      <button type="button" className="admin-icon-button" aria-label={`View ${row.name}`} title="View" onClick={() => onView(row._id)}><AdminIcon name="eye" /></button>
                      <button type="button" className="admin-icon-button" aria-label={`Edit ${row.name}`} title="Edit" onClick={() => onEdit(row._id)}><AdminIcon name="edit" /></button>
                      <button type="button" className="admin-icon-button admin-icon-danger" aria-label={`Delete ${row.name}`} title="Delete" onClick={() => onDelete(row)}><AdminIcon name="trash" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div className="admin-table-footer"><span>Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} destinations</span>
              <div className="admin-pagination"><button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><AdminIcon name="chevronLeft" /></button><span>Page {currentPage} / {totalPages}</span><button type="button" aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}><AdminIcon name="chevronRight" /></button></div>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function validateDestinationForm(values) {
  const maxLengths = { name: 120, country: 100, district: 120, category: 100, description: 3000 };
  for (const [field, maximum] of Object.entries(maxLengths)) {
    const value = values[field];
    if (!value) return `Please enter a valid ${field === "district" ? "district / region" : field}.`;
    if (value.length > maximum) return `${field} must be ${maximum} characters or fewer.`;
  }
  if (values.imageUrl) {
    const value = values.imageUrl;
    if (value.length > 2048 || /[\s<>"\\]/.test(value)) return "Enter a valid image URL without spaces.";
    const localPath = value.startsWith("/") && !value.startsWith("//");
    let remote = false;
    try {
      const url = new URL(value);
      remote = (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
    } catch { /* Only absolute HTTP(S) URLs or local image paths are allowed. */ }
    if (!localPath && !remote) return "Use an https:// image URL or a local path beginning with /.";
  }
  return "";
}

function DestinationForm({ destination, onBack, onSaved }) {
  const isEditing = Boolean(destination?._id);
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(destination || {}) });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const payload = Object.fromEntries(Object.keys(EMPTY_FORM).map((key) => [key, (form[key] || "").trim()]));
    const validationError = validateDestinationForm(payload);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      if (isEditing) await updateDestination(destination._id, payload);
      else await createDestination(payload);
      await onSaved(isEditing);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save destination.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button type="button" className="admin-back-link" onClick={onBack}><AdminIcon name="back" />Back to destinations</button>
      <div className="admin-page-heading admin-form-page-heading"><div><p className="admin-panel-eyebrow">{isEditing ? "Update listing" : "New listing"}</p><h1>{isEditing ? "Edit Destination" : "Add New Destination"}</h1><p>{isEditing ? "Update travel details and your cover image." : "Create a new travel destination for Explore World."}</p></div></div>
      <form onSubmit={handleSubmit} className="admin-edit-layout">
        <section className="admin-surface-card admin-form-section">
          <div className="admin-section-heading"><div><p className="admin-panel-eyebrow">Destination details</p><h2>Basic information</h2></div></div>
          <div className="admin-form-grid">
            <label className="admin-form-wide">Destination name <span className="admin-required">*</span><input name="name" value={form.name || ""} onChange={updateField} placeholder="e.g. Ella" required maxLength={120} /></label>
            <label>Country <span className="admin-required">*</span><input list="explore-admin-country-list" name="country" value={form.country || ""} onChange={updateField} placeholder="Select or type a country" required maxLength={100} /></label>
            <label>Category <span className="admin-required">*</span><input list="explore-admin-category-list" name="category" value={form.category || ""} onChange={updateField} placeholder="e.g. Nature" required maxLength={100} /></label>
            <label className="admin-form-wide">District / Region <span className="admin-required">*</span><input name="district" value={form.district || ""} onChange={updateField} placeholder="e.g. Badulla" required maxLength={120} /></label>
            <label className="admin-form-wide">Description <span className="admin-required">*</span><textarea name="description" value={form.description || ""} onChange={updateField} placeholder="What makes this place special?" rows={6} maxLength={3000} required /></label>
            <label className="admin-form-wide">Cover image URL <span className="admin-optional">Optional</span><input name="imageUrl" value={form.imageUrl || ""} onChange={updateField} placeholder="https://... or /images/destinations/ella.jpg" maxLength={2048} /><small>Use a hosted image URL or a path to an image already in your public folder. The current API supports one image per destination.</small></label>
          </div>
          <datalist id="explore-admin-country-list">{COUNTRY_SUGGESTIONS.map((item) => <option key={item} value={item} />)}</datalist>
          <datalist id="explore-admin-category-list">{CATEGORY_SUGGESTIONS.map((item) => <option key={item} value={item} />)}</datalist>
          {error && <div className="admin-alert" role="alert">{error}</div>}
          <div className="admin-form-actions"><button className="admin-secondary-button" type="button" onClick={onBack}>Cancel</button><button className="admin-primary-button" type="submit" disabled={saving}><AdminIcon name="check" />{saving ? "Saving…" : isEditing ? "Update destination" : "Create destination"}</button></div>
        </section>
        <aside className="admin-surface-card admin-cover-panel">
          <div><p className="admin-panel-eyebrow">Live preview</p><h2>Destination cover</h2></div>
          <DestinationImage url={form.imageUrl} alt={form.name || "Destination cover preview"} className="admin-cover-preview" />
          <h3>{form.name || "Your destination"}</h3><p>{[form.district, form.country].filter(Boolean).join(", ") || "Location appears here"}</p>
          <span className="admin-preview-hint">The cover will appear in the dashboard and destination list.</span>
        </aside>
      </form>
    </>
  );
}

function DestinationDetails({ destination, onBack, onEdit, onDelete }) {
  return (
    <>
      <button className="admin-back-link" type="button" onClick={onBack}><AdminIcon name="back" />Back to destinations</button>
      <div className="admin-page-heading admin-detail-page-heading">
        <div><p className="admin-panel-eyebrow">Destination preview</p><h1>{destination.name}</h1><p><AdminIcon name="pin" /> {destination.district ? `${destination.district}, ` : ""}{destination.country}{destination.category ? ` · ${destination.category}` : ""}</p></div>
        <div className="admin-detail-actions"><button type="button" className="admin-primary-button" onClick={() => onEdit(destination._id)}><AdminIcon name="edit" />Edit</button><button type="button" className="admin-secondary-button admin-danger-button" onClick={() => onDelete(destination)}><AdminIcon name="trash" />Delete</button></div>
      </div>
      <div className="admin-details-layout">
        <section className="admin-details-main">
          <div className="admin-details-photo-wrap"><DestinationImage className="admin-details-photo" url={destination.imageUrl} alt={destination.name} /></div>
          <div className="admin-surface-card admin-description-card"><h2>About this destination</h2><p>{destination.description}</p></div>
        </section>
        <aside className="admin-details-side">
          <div className="admin-surface-card admin-details-facts"><p className="admin-panel-eyebrow">At a glance</p><dl><div><dt>Country</dt><dd>{destination.country || "—"}</dd></div><div><dt>Region</dt><dd>{destination.district || "—"}</dd></div><div><dt>Category</dt><dd>{destination.category || "—"}</dd></div></dl></div>
          <div className="admin-surface-card admin-date-facts"><div><AdminIcon name="calendar" /><span>Created<small>{formatDate(destination.createdAt)}</small></span></div><div><AdminIcon name="refresh" /><span>Last updated<small>{formatDate(destination.updatedAt)}</small></span></div></div>
        </aside>
      </div>
    </>
  );
}

function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [notice, setNotice] = useState("");

  // All subviews use query parameters so the existing two protected routes
  // (/admin and /admin/destinations) continue working without App.jsx edits.
  const params = new URLSearchParams(location.search);
  const isManageRoute = location.pathname.startsWith("/admin/destinations");
  const view = isManageRoute ? (params.get("view") || "list") : "dashboard";
  const selectedId = params.get("id");
  const selected = rows.find((item) => String(item._id) === selectedId);

  const loadDestinations = useCallback(async () => {
    setStatus({ loading: true, error: "" });
    try {
      const data = await getDestinations();
      if (!Array.isArray(data)) throw new Error("Unexpected destination API response.");
      setRows(data);
      setStatus({ loading: false, error: "" });
    } catch (requestError) {
      setStatus({ loading: false, error: requestError instanceof Error ? requestError.message : "Unable to load destinations." });
    }
  }, []);

  useEffect(() => { loadDestinations(); }, [loadDestinations]);

  const goList = () => navigate("/admin/destinations");
  const goCreate = () => navigate("/admin/destinations?view=add");
  const goEdit = (id) => navigate(`/admin/destinations?view=edit&id=${encodeURIComponent(id)}`);
  const goDetails = (id) => navigate(`/admin/destinations?view=details&id=${encodeURIComponent(id)}`);

  async function handleSaved(wasEditing) {
    await loadDestinations();
    setNotice(wasEditing ? "Destination updated successfully." : "Destination created successfully.");
    goList();
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    try {
      await deleteDestination(item._id);
      setRows((current) => current.filter((row) => row._id !== item._id));
      setStatus((current) => ({ ...current, error: "" }));
      setNotice(`${item.name} was deleted.`);
      if (view === "details") goList();
    } catch (requestError) {
      setStatus((current) => ({ ...current, error: requestError instanceof Error ? requestError.message : "Unable to delete destination." }));
    }
  }

  let screen;
  if (view === "dashboard") {
    screen = <DashboardOverview rows={rows} loading={status.loading} onCreate={goCreate} onEdit={goEdit} onView={goDetails} />;
  } else if (view === "list") {
    screen = <ManageDestinations rows={rows} loading={status.loading} onCreate={goCreate} onEdit={goEdit} onView={goDetails} onDelete={handleDelete} onRefresh={loadDestinations} />;
  } else if (view === "add") {
    screen = <DestinationForm key="new" onBack={goList} onSaved={handleSaved} />;
  } else if (view === "edit" || view === "details") {
    screen = status.loading && !selected ? <p className="admin-muted">Loading destination…</p> : !selected ? (
      <div className="admin-surface-card admin-missing-state"><h2>Destination not found</h2><p>It may have been deleted or the link may be invalid.</p><button type="button" className="admin-secondary-button" onClick={goList}>Back to destinations</button></div>
    ) : view === "edit" ? (
      <DestinationForm key={selected._id} destination={selected} onBack={goList} onSaved={handleSaved} />
    ) : (
      <DestinationDetails destination={selected} onBack={goList} onEdit={goEdit} onDelete={handleDelete} />
    );
  } else {
    screen = <ManageDestinations rows={rows} loading={status.loading} onCreate={goCreate} onEdit={goEdit} onView={goDetails} onDelete={handleDelete} onRefresh={loadDestinations} />;
  }

  return (
    <main className="admin-panel">
      <AdminSidebar />
      <section className="admin-panel-main">
        {notice && <div className="admin-success-notice" role="status"><AdminIcon name="check" />{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><AdminIcon name="close" /></button></div>}
        {status.error && <div className="admin-alert" role="alert">{status.error}</div>}
        {screen}
      </section>
    </main>
  );
}

export default AdminDashboard;
