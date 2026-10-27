import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { getDestinations } from "./services/destinationService";
import "./App.css";

const imagePaths = {
  hero: "/images/homepage/hero-tropical-islands.webp",
  patagonia: "/images/homepage/patagonia.webp",
  iceland: "/images/homepage/iceland.webp",
  morocco: "/images/homepage/morocco.webp"
};

const countries = [
  { name: "Sri Lanka", slug: "sri-lanka", region: "South Asia", tagline: "Beaches, heritage and wild nature", image: imagePaths.hero },
  { name: "Nepal", slug: "nepal", region: "South Asia", tagline: "Mountain, temples and spiritual journeys", image: imagePaths.patagonia },
  { name: "Indonesia", slug: "indonesia", region: "Southeast Asia", tagline: "Islands, volcanoes and rich culture", image: imagePaths.morocco },
  { name: "Thailand", slug: "thailand", region: "Southeast Asia", tagline: "Beaches, islands and vibrant life", image: imagePaths.iceland }
];

const destinations = [
  { id: "ella", name: "Ella", country: "Sri Lanka", category: "Nature", image: imagePaths.hero, description: "A scenic hill town in the heart of Sri Lanka, known for its lush tea plantations, iconic bridges and mountain views.", facts: ["Elevation 1,041 m", "Best time Dec - Apr", "Travel time 6 - 8 hrs from Colombo"] },
  { id: "sigiriya", name: "Sigiriya", country: "Sri Lanka", category: "Heritage", image: imagePaths.morocco, description: "An ancient rock fortress surrounded by gardens, stories and unforgettable views across the island.", facts: ["Heritage site", "Best time Jan - Apr", "Travel time 4 hrs from Colombo"] },
  { id: "galle", name: "Galle", country: "Sri Lanka", category: "Beach", image: imagePaths.iceland, description: "A beautifully preserved coastal fort where old-world streets meet the warm Indian Ocean.", facts: ["Coastal escape", "Best time Nov - Apr", "Travel time 2 hrs from Colombo"] },
  { id: "pokhara", name: "Pokhara", country: "Nepal", category: "Adventure", image: imagePaths.patagonia, description: "A calm lakeside city framed by the Himalayas and made for slow mornings and bold adventures.", facts: ["Mountain gateway", "Best time Oct - Nov", "Travel time 25 min from Kathmandu"] }
];

function Logo() {
  return <Link className="brand" to="/"><span className="brand-symbol">⌁</span><span>Explore <b>World</b><small>Global Destination Explorer</small></span></Link>;
}

function Header({ admin = false }) {
  return (
    <header className={`topbar ${admin ? "topbar-admin" : ""}`}>
      <Logo />
      <nav className="main-nav" aria-label="Main navigation">
        <Link to="/">Home</Link>
        <Link to="/countries">Countries</Link>
        <Link to="/destinations">Destinations</Link>
        <Link to="/destinations">Hotels</Link>
        <Link to="/about">About</Link>
      </nav>
      <div className="header-actions">
        <button type="button" aria-label="Search">⌕</button>
        <Link to="/admin/destinations" aria-label="Admin dashboard">◉</Link>
        <Link className="profile-dot" to="/admin/destinations">A</Link>
      </div>
    </header>
  );
}

function DestinationCard({ destination }) {
  return (
    <Link className="destination-tile" to={`/destinations/${destination.id}`}>
      <div className="tile-image"><img src={destination.image} alt="" /><span className="heart">♡</span></div>
      <div className="tile-copy"><span>{destination.country} · {destination.category}</span><h3>{destination.name}</h3><small>Explore destination <b>→</b></small></div>
    </Link>
  );
}

function Home() {
  return (
    <main className="app-shell">
      <Header />
      <section className="home-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(1, 38, 35, .9), rgba(1, 38, 35, .15)), url(${imagePaths.hero})` }}>
        <div className="hero-copy">
          <p className="kicker">Your next journey starts here</p>
          <h1>Explore<br /><em>The</em> <strong>World</strong></h1>
          <p>Discover stunning destinations, rich cultures and unforgettable experiences.</p>
          <div className="search-bar"><span>⌕</span><input aria-label="Search destinations" placeholder="Search destinations, countries..." /><Link to="/destinations">→</Link></div>
        </div>
        <div className="hero-bottom">
          {["Travel guides", "Top destinations", "Best stays", "Local experiences"].map((item, index) => <div key={item}><span className="feature-icon">{["✈", "⌖", "♜", "♧"][index]}</span><b>{item}</b><small>{["Expert tips", "Handpicked places", "Comfort & style", "Culture & adventure"][index]}</small></div>)}
        </div>
      </section>
      <section className="home-intro content-width">
        <div><p className="kicker">Curated for curious travelers</p><h2>Find a place<br /><em>that feels like</em> <strong>yours.</strong></h2></div>
        <Link className="outline-button" to="/countries">Explore countries <span>→</span></Link>
      </section>
      <section className="content-width card-section"><div className="section-title"><div><p className="kicker">Start exploring</p><h2>Popular destinations</h2></div><Link to="/destinations">View all →</Link></div><div className="destination-grid">{destinations.slice(0, 3).map((destination) => <DestinationCard key={destination.id} destination={destination} />)}</div></section>
    </main>
  );
}

function Countries() {
  return <main className="app-shell"><Header /><section className="page-heading"><p className="kicker">Explore our countries</p><h1>Discover the <em>World</em></h1><p>From tropical beaches to majestic mountains, explore our handpicked countries.</p></section><section className="country-grid content-width">{countries.map((country) => <Link className="country-tile" to={`/countries/${country.slug}`} key={country.slug}><img src={country.image} alt="" /><div><h2>{country.name}</h2><p>{country.tagline}</p><span>→</span></div></Link>)}</section></main>;
}

function CountryDestinations() {
  const { countrySlug } = useParams();
  const country = countries.find((item) => item.slug === countrySlug) || countries[0];
  const list = destinations.filter((item) => item.country === country.name);
  return <main className="app-shell"><Header /><section className="country-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(1, 38, 35, .92), rgba(1, 38, 35, .12)), url(${country.image})` }}><div><p className="kicker">{country.region}</p><h1>{country.name}</h1><p>{country.name === "Sri Lanka" ? "The Pearl of the Indian Ocean" : country.tagline}</p><span>Explore a land of ancient stories, warm people and unforgettable landscapes.</span></div></section><section className="filter-bar content-width"><button className="active" type="button">All</button>{["Nature", "Heritage", "Beach", "Adventure"].map((filter) => <button type="button" key={filter}>{filter}</button>)}</section><section className="content-width destination-grid country-results">{(list.length ? list : destinations).map((destination) => <DestinationCard key={destination.id} destination={destination} />)}</section></main>;
}

function DestinationDetails() {
  const { destinationId } = useParams();
  const destination = destinations.find((item) => item.id === destinationId) || destinations[0];
  return <main className="app-shell"><Header /><section className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(1, 38, 35, .88), rgba(1, 38, 35, .1)), url(${destination.image})` }}><div><p className="kicker">{destination.country}</p><h1>{destination.name}</h1><p>{destination.description}</p><div className="detail-actions"><button className="lime-button" type="button">Add to plan ♡</button><button className="ghost-button" type="button">View on map ↗</button></div></div></section><section className="fact-row content-width">{destination.facts.map((fact) => <div key={fact}><span>◷</span><b>{fact.split(" ").slice(0, 2).join(" ")}</b><small>{fact}</small></div>)}</section><section className="content-width detail-content"><div><p className="kicker">Discover {destination.name}</p><h2>A journey worth<br /><em>remembering.</em></h2><p>{destination.description} Take your time, meet the people and let the landscape set the pace.</p></div><div className="detail-gallery"><img src={destination.image} alt={`${destination.name} landscape`} /><img src={imagePaths.iceland} alt="Travel landscape" /></div></section></main>;
}

function Admin() {
  const [rows, setRows] = useState(destinations);
  const [loading, setLoading] = useState(false);
  useEffect(() => { getDestinations().then((data) => { if (data.length) setRows(data); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  return <main className="admin-shell"><Header admin /><div className="admin-layout"><aside className="admin-sidebar"><p>WORKSPACE</p>{["Dashboard", "Destinations", "Add Destination", "Manage Destinations", "Countries", "Users", "Settings"].map((item) => <Link className={item === "Manage Destinations" ? "selected" : ""} to={item === "Countries" ? "/countries" : "/admin/destinations"} key={item}><span>◈</span>{item}</Link>)}</aside><section className="admin-content"><div className="admin-heading"><div><p className="kicker">Admin workspace</p><h1>Manage Destinations</h1></div><Link className="lime-button" to="/admin/destinations">＋ Add Destination</Link></div><div className="admin-table"><div className="table-head"><span>#</span><span>Image</span><span>Destination</span><span>Country</span><span>Category</span><span>Actions</span></div>{rows.map((row, index) => <div className="table-row" key={row.id || row._id}><span>{index + 1}</span><img src={row.image || row.imageUrl || imagePaths.hero} alt="" /><b>{row.name}</b><span>{row.country || row.district || "Sri Lanka"}</span><span>{row.category}</span><span className="row-actions">✎ / ♧</span></div>)}</div>{loading && <p>Loading destinations...</p>}</section></div></main>;
}

function About() {
  return <main className="app-shell"><Header /><section className="simple-page content-width"><p className="kicker">About Explore World</p><h1>Go further.<br /><em>Feel more.</em></h1><p>Explore World connects curious travelers with meaningful places, thoughtful guides and journeys that stay with you long after you return home.</p><Link className="lime-button" to="/countries">Start exploring →</Link></section></main>;
}

function App() {
  return <Routes><Route path="/" element={<Home />} /><Route path="/countries" element={<Countries />} /><Route path="/countries/:countrySlug" element={<CountryDestinations />} /><Route path="/destinations" element={<CountryDestinations />} /><Route path="/destinations/:destinationId" element={<DestinationDetails />} /><Route path="/admin/destinations" element={<Admin />} /><Route path="/about" element={<About />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}

export default App;
