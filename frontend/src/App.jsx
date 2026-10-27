import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import Homepage from "./components/Homepage";
import { getDestinations } from "./services/destinationService";
import { countryImage, destinationImages, normalizeSlug } from "./data/destinationImages";
import ImagePlaceholder from "./components/ImagePlaceholder";
import "./App.css";

const countries = [
  { name: "Sri Lanka", slug: "sri-lanka", region: "South Asia", tagline: "Beaches, heritage and wild nature", image: countryImage["sri-lanka"] },
  { name: "India", slug: "india", region: "South Asia", tagline: "History, culture and vivid landscapes", image: countryImage.india },
  { name: "Nepal", slug: "nepal", region: "South Asia", tagline: "Mountains, temples and spiritual journeys", image: countryImage.nepal },
  { name: "Indonesia", slug: "indonesia", region: "Southeast Asia", tagline: "Islands, volcanoes and rich culture", image: countryImage.indonesia },
  { name: "Thailand", slug: "thailand", region: "Southeast Asia", tagline: "Beaches, islands and vibrant life", image: countryImage.thailand }
];

const destinationDetails = {
  "sri-lanka": {
    "nine-arch-bridge": { name: "Nine Arch Bridge", category: "Nature", imageKey: "nine-arch-bridge", description: "A scenic bridge surrounded by the lush hills of Ella.", facts: ["Hill country", "Best time Dec - Apr"] },
    sigiriya: { name: "Sigiriya", category: "Heritage", imageKey: "sigiriya", description: "An ancient rock fortress surrounded by gardens, stories and unforgettable views.", facts: ["Heritage site", "Best time Jan - Apr"] },
    galle: { name: "Galle", category: "Beach", imageKey: "galle", description: "A beautifully preserved coastal fort where old-world streets meet the Indian Ocean.", facts: ["Coastal escape", "Best time Nov - Apr"] },
    mirissa: { name: "Mirissa", category: "Beach", imageKey: "mirissa", description: "A palm-fringed coastal escape on Sri Lanka’s southern shore.", facts: ["Southern coast", "Best time Nov - Apr"] },
    "temple-of-tooth-relic": { name: "Temple of the Tooth Relic", category: "Heritage", imageKey: "temple-of-tooth-relic", description: "A major cultural and religious landmark in Kandy.", facts: ["Cultural landmark", "Central Sri Lanka"] }
  },
  india: {
    goa: { name: "Goa", category: "Beach", imageKey: "goa" },
    "hawa-mahal": { name: "Hawa Mahal", category: "Heritage", imageKey: "hawa-mahal" },
    "kerala-backwaters": { name: "Kerala Backwaters", category: "Nature", imageKey: "kerala-backwaters" },
    "taj-mahal": { name: "Taj Mahal", category: "Heritage", imageKey: "taj-mahal" },
    varanasi: { name: "Varanasi", category: "Culture", imageKey: "varanasi" }
  },
  indonesia: {
    "bali-ubud-tegallalang-rice-terraces": { name: "Bali Ubud Tegallalang Rice Terraces", category: "Nature", imageKey: "bali-ubud-tegallalang-rice-terraces" },
    borobudur: { name: "Borobudur Temple", category: "Heritage", imageKey: "borobudur" },
    "mount-bromo": { name: "Mount Bromo", category: "Adventure", imageKey: "mount-bromo" },
    "nusa-penida-kelingking-beach": { name: "Nusa Penida Kelingking Beach", category: "Beach", imageKey: "nusa-penida-kelingking-beach" },
    "raja-ampat-islands": { name: "Raja Ampat Islands", category: "Nature", imageKey: "raja-ampat-islands" }
  },
  nepal: {
    "annapurna-range": { name: "Annapurna Range", category: "Adventure", imageKey: "annapurna-range" },
    "kathmandu-boudhanath-stupa": { name: "Kathmandu Boudhanath Stupa", category: "Heritage", imageKey: "kathmandu-boudhanath-stupa" },
    lumbini: { name: "Lumbini", category: "Heritage", imageKey: "lumbini" },
    "phewa-lake-serenity": { name: "Phewa Lake Serenity", category: "Nature", imageKey: "phewa-lake-serenity" },
    everest: { name: "Everest", category: "Adventure", imageKey: "everest" }
  },
  thailand: {
    "bangkok-wat-arun": { name: "Bangkok Wat Arun", category: "Heritage", imageKey: "bangkok-wat-arun" },
    "chiang-mai-doi-suthep": { name: "Chiang Mai Doi Suthep", category: "Heritage", imageKey: "chiang-mai-doi-suthep" },
    "krabi-railay-beach": { name: "Krabi Railay Beach", category: "Beach", imageKey: "krabi-railay-beach" },
    "phi-phi-islands": { name: "Phi Phi Islands", category: "Beach", imageKey: "phi-phi-islands" },
    "phuket-patong-beach": { name: "Phuket Patong Beach", category: "Beach", imageKey: "phuket-patong-beach" }
  }
};

const destinations = Object.entries(destinationDetails).flatMap(([countrySlug, places]) => (
  Object.entries(places).map(([id, place]) => ({
    id,
    ...place,
    country: countries.find((country) => country.slug === countrySlug).name,
    countrySlug,
    image: destinationImages[countrySlug]?.[place.imageKey] || null,
    description: place.description || "Destination details are not available yet.",
    facts: place.facts || ["Destination details unavailable"]
  }))
));

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
      <div className="tile-image">{destination.image ? <img src={destination.image} alt={`${destination.name} destination`} /> : <ImagePlaceholder />}<span className="heart">♡</span></div>
      <div className="tile-copy"><span>{destination.country} · {destination.category}</span><h3>{destination.name}</h3><small>Explore destination <b>→</b></small></div>
    </Link>
  );
}

function Countries() {
  return <main className="app-shell"><Header /><section className="page-heading"><p className="kicker">Explore our countries</p><h1>Discover the <em>World</em></h1><p>From tropical beaches to majestic mountains, explore our handpicked countries.</p></section><section className="country-grid content-width">{countries.map((country) => <Link className="country-tile" to={`/countries/${country.slug}`} key={country.slug}>{country.image ? <img src={country.image} alt={`${country.name} landscape`} /> : <ImagePlaceholder />}<div><h2>{country.name}</h2><p>{country.tagline}</p><span>→</span></div></Link>)}</section></main>;
}

function CountryDestinations() {
  const { countrySlug } = useParams();
  const country = countries.find((item) => item.slug === normalizeSlug(countrySlug || "sri-lanka"));
  if (!country) return <main className="country-placeholder-page"><p className="eyebrow">Unknown country</p><h1>That journey is not on the map yet.</h1><Link className="primary-button" to="/countries">Return to countries <span aria-hidden="true">↗</span></Link></main>;
  const list = destinations.filter((item) => item.countrySlug === country.slug);
  return <main className="app-shell"><Header /><section className="country-hero" style={country.image ? { backgroundImage: `linear-gradient(90deg, rgba(1, 38, 35, .92), rgba(1, 38, 35, .12)), url(${country.image})` } : undefined}><div><p className="kicker">{country.region}</p><h1>{country.name}</h1><p>{country.name === "Sri Lanka" ? "The Pearl of the Indian Ocean" : country.tagline}</p><span>Explore a land of ancient stories, warm people and unforgettable landscapes.</span></div></section><section className="filter-bar content-width"><button className="active" type="button">All</button>{["Nature", "Heritage", "Beach", "Adventure"].map((filter) => <button type="button" key={filter}>{filter}</button>)}</section><section className="content-width destination-grid country-results">{list.map((destination) => <DestinationCard key={destination.id} destination={destination} />)}</section></main>;
}

function DestinationDetails() {
  const { destinationId } = useParams();
  const destination = destinations.find((item) => item.id === normalizeSlug(destinationId));
  if (!destination) return <main className="country-placeholder-page"><p className="eyebrow">Unknown destination</p><h1>That destination is not on the map yet.</h1><Link className="primary-button" to="/countries">Return to countries <span aria-hidden="true">↗</span></Link></main>;
  return <main className="app-shell"><Header /><section className="detail-hero" style={destination.image ? { backgroundImage: `linear-gradient(90deg, rgba(1, 38, 35, .88), rgba(1, 38, 35, .1)), url(${destination.image})` } : undefined}><div><p className="kicker">{destination.country}</p><h1>{destination.name}</h1><p>{destination.description}</p><div className="detail-actions"><button className="lime-button" type="button">Add to plan ♡</button><button className="ghost-button" type="button">View on map ↗</button></div></div></section><section className="fact-row content-width">{destination.facts.map((fact) => <div key={fact}><span>◷</span><b>{fact.split(" ").slice(0, 2).join(" ")}</b><small>{fact}</small></div>)}</section><section className="content-width detail-content"><div><p className="kicker">Discover {destination.name}</p><h2>A journey worth<br /><em>remembering.</em></h2><p>{destination.description}</p></div><div className="detail-gallery">{destination.image ? <img src={destination.image} alt={`${destination.name} landscape`} /> : <ImagePlaceholder />}</div></section></main>;
}

function Admin() {
  const [rows, setRows] = useState(destinations);
  const [loading, setLoading] = useState(false);
  useEffect(() => { getDestinations().then((data) => { if (data.length) setRows(data); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  return <main className="admin-shell"><Header admin /><div className="admin-layout"><aside className="admin-sidebar"><p>WORKSPACE</p>{["Dashboard", "Destinations", "Add Destination", "Manage Destinations", "Countries", "Users", "Settings"].map((item) => <Link className={item === "Manage Destinations" ? "selected" : ""} to={item === "Countries" ? "/countries" : "/admin/destinations"} key={item}><span>◈</span>{item}</Link>)}</aside><section className="admin-content"><div className="admin-heading"><div><p className="kicker">Admin workspace</p><h1>Manage Destinations</h1></div><Link className="lime-button" to="/admin/destinations">＋ Add Destination</Link></div><div className="admin-table"><div className="table-head"><span>#</span><span>Image</span><span>Destination</span><span>Country</span><span>Category</span><span>Actions</span></div>{rows.map((row, index) => <div className="table-row" key={row.id || row._id}><span>{index + 1}</span>{row.image || row.imageUrl ? <img src={row.image || row.imageUrl} alt="" /> : <ImagePlaceholder />}<b>{row.name}</b><span>{row.country || row.district || "Country unavailable"}</span><span>{row.category}</span><span className="row-actions">✎ / ♧</span></div>)}</div>{loading && <p>Loading destinations...</p>}</section></div></main>;
}

function About() {
  return <main className="app-shell"><Header /><section className="simple-page content-width"><p className="kicker">About Explore World</p><h1>Go further.<br /><em>Feel more.</em></h1><p>Explore World connects curious travelers with meaningful places, thoughtful guides and journeys that stay with you long after you return home.</p><Link className="lime-button" to="/countries">Start exploring →</Link></section></main>;
}

function App() {
  return <Routes><Route path="/" element={<Homepage />} /><Route path="/countries" element={<Countries />} /><Route path="/countries/:countrySlug" element={<CountryDestinations />} /><Route path="/destinations" element={<CountryDestinations />} /><Route path="/destinations/:destinationId" element={<DestinationDetails />} /><Route path="/admin/destinations" element={<Admin />} /><Route path="/about" element={<About />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}

export default App;
