import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import Homepage from "./components/Homepage";
import { getDestinations } from "./services/destinationService";
import { getCurrentUser, login, logout, signup } from "./services/authService";
import { countryImage, destinationImages, normalizeSlug } from "./data/destinationImages";
import ImagePlaceholder from "./components/ImagePlaceholder";
import galleImage from "./assets/destinations/srilanka/galle.jpg";
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

const hotels = [
  { id: "jetwing-lighthouse", name: "Jetwing Lighthouse", countrySlug: "sri-lanka", country: "Sri Lanka", destination: "Galle", destinationId: "galle", price: 185, rating: 4.7, stay: [1, 7], type: "Luxury", description: "A peaceful clifftop retreat beside Galle, known for ocean views, thoughtful service and easy access to the historic Fort.", amenities: ["Ocean view", "Pool", "Breakfast"] },
  { id: "98-acres-resort", name: "98 Acres Resort & Spa", countrySlug: "sri-lanka", country: "Sri Lanka", destination: "Ella", destinationId: "nine-arch-bridge", price: 165, rating: 4.8, stay: [2, 5], type: "Boutique", description: "An eco-conscious hillside stay surrounded by tea country, close to Ella's walking trails and Nine Arch Bridge.", amenities: ["Mountain view", "Spa", "Restaurant"] },
  { id: "shangri-la-colombo", name: "Shangri-La Colombo", countrySlug: "sri-lanka", country: "Sri Lanka", destination: "Colombo", destinationId: "galle", price: 210, rating: 4.6, stay: [1, 4], type: "Luxury", description: "A modern waterfront base for travelers who want city comforts, dining and a convenient start to a Sri Lankan itinerary.", amenities: ["Waterfront", "Gym", "Airport transfer"] },
  { id: "oberoi-amarvilas", name: "The Oberoi Amarvilas", countrySlug: "india", country: "India", destination: "Agra", destinationId: "taj-mahal", price: 390, rating: 4.9, stay: [1, 3], type: "Luxury", description: "A refined Agra stay with uninterrupted Taj Mahal views, ideal for a short heritage stop.", amenities: ["Taj view", "Pool", "Fine dining"] },
  { id: "seashell-beach-suites", name: "Seashell Beach Suites", countrySlug: "india", country: "India", destination: "Goa", destinationId: "goa", price: 95, rating: 4.4, stay: [3, 10], type: "Beach", description: "Relaxed suites near North Goa beaches with space for longer stays and easy access to local cafés.", amenities: ["Beach nearby", "Kitchenette", "Pool"] },
  { id: "the-leela-palace-jaipur", name: "The Leela Palace Jaipur", countrySlug: "india", country: "India", destination: "Jaipur", destinationId: "hawa-mahal", price: 245, rating: 4.8, stay: [2, 5], type: "Luxury", description: "A calm palace-style base for exploring Jaipur's forts, markets and historic architecture.", amenities: ["Garden", "Pool", "Spa"] },
  { id: "hotel-barahi-kathmandu", name: "Hotel Barahi Kathmandu", countrySlug: "nepal", country: "Nepal", destination: "Kathmandu", destinationId: "kathmandu-boudhanath-stupa", price: 78, rating: 4.3, stay: [2, 6], type: "City stay", description: "A comfortable city hotel for cultural explorers visiting Kathmandu's temples and UNESCO heritage sites.", amenities: ["Central location", "Breakfast", "Airport transfer"] },
  { id: "temple-tree-resort", name: "Temple Tree Resort & Spa", countrySlug: "nepal", country: "Nepal", destination: "Pokhara", destinationId: "phewa-lake-serenity", price: 115, rating: 4.6, stay: [2, 8], type: "Boutique", description: "A garden resort near Phewa Lake, suited to slow mornings, mountain views and short adventure breaks.", amenities: ["Garden", "Pool", "Spa"] },
  { id: "hotel-everest-view", name: "Hotel Everest View", countrySlug: "nepal", country: "Nepal", destination: "Everest region", destinationId: "everest", price: 185, rating: 4.7, stay: [1, 2], type: "Mountain lodge", description: "A high-altitude lodge with remarkable Himalayan views for trekkers planning a focused Everest experience.", amenities: ["Himalayan view", "Restaurant", "Trekking base"] },
  { id: "alila-seminyak", name: "Alila Seminyak", countrySlug: "indonesia", country: "Indonesia", destination: "Bali", destinationId: "bali-ubud-tegallalang-rice-terraces", price: 220, rating: 4.7, stay: [3, 10], type: "Beach", description: "A stylish beachfront resort for combining Bali's coast with day trips to Ubud and the rice terraces.", amenities: ["Beachfront", "Pool", "Spa"] },
  { id: "plataran-ubud", name: "Plataran Ubud Hotel & Spa", countrySlug: "indonesia", country: "Indonesia", destination: "Ubud", destinationId: "bali-ubud-tegallalang-rice-terraces", price: 135, rating: 4.6, stay: [2, 8], type: "Boutique", description: "A peaceful Ubud stay surrounded by gardens, close to art, rice terraces and cultural experiences.", amenities: ["Garden", "Yoga", "Restaurant"] },
  { id: "misool-eco-resort", name: "Misool Eco Resort", countrySlug: "indonesia", country: "Indonesia", destination: "Raja Ampat", destinationId: "raja-ampat-islands", price: 420, rating: 4.9, stay: [5, 14], type: "Island retreat", description: "A remote conservation-minded island retreat for divers and travelers planning a longer Raja Ampat escape.", amenities: ["House reef", "Diving", "Full board"] },
  { id: "rayavadee-krabi", name: "Rayavadee", countrySlug: "thailand", country: "Thailand", destination: "Krabi", destinationId: "krabi-railay-beach", price: 310, rating: 4.8, stay: [2, 7], type: "Beach", description: "A lush peninsula resort with access to Railay's dramatic limestone cliffs and clear-water beaches.", amenities: ["Private beach", "Pool", "Boat transfer"] },
  { id: "137-pillars-house", name: "137 Pillars House Chiang Mai", countrySlug: "thailand", country: "Thailand", destination: "Chiang Mai", destinationId: "chiang-mai-doi-suthep", price: 175, rating: 4.7, stay: [2, 6], type: "Boutique", description: "An intimate heritage stay for exploring Chiang Mai's temples, food scene and Doi Suthep.", amenities: ["Heritage design", "Pool", "Spa"] },
  { id: "the-siam-bangkok", name: "The Siam Bangkok", countrySlug: "thailand", country: "Thailand", destination: "Bangkok", destinationId: "bangkok-wat-arun", price: 280, rating: 4.8, stay: [2, 5], type: "Luxury", description: "A riverside boutique hotel with easy access to Bangkok's historic temples and cultural neighborhoods.", amenities: ["Riverside", "Butler service", "Pool"] }
];

const hotelOfficialDetails = {
  "jetwing-lighthouse": { brand: "JL", url: "https://www.jetwinghotels.com/jetwinglighthouse/" },
  "98-acres-resort": { brand: "98A", url: "https://98acresresort.com/" },
  "shangri-la-colombo": { brand: "SL", url: "https://www.shangri-la.com/colombo/shangrila/" },
  "oberoi-amarvilas": { brand: "OA", url: "https://www.oberoihotels.com/amarvilas-agra/" },
  "seashell-beach-suites": { brand: "SB", url: "https://www.seashellgoa.com/" },
  "the-leela-palace-jaipur": { brand: "LPJ", url: "https://www.theleela.com/the-leela-palace-jaipur/" },
  "hotel-barahi-kathmandu": { brand: "HB", url: "https://hotelbarahi.com/kathmandu/" },
  "temple-tree-resort": { brand: "TT", url: "https://www.templetree.com.np/" },
  "hotel-everest-view": { brand: "HEV", url: "https://hoteleverestview.com/" },
  "alila-seminyak": { brand: "AS", url: "https://www.hyatt.com/alila-hotels-and-resorts/en-US/dpsal-alila-seminyak" },
  "plataran-ubud": { brand: "PU", url: "https://www.plataran.com/ubud/" },
  "misool-eco-resort": { brand: "MER", url: "https://www.misool.info/" },
  "rayavadee-krabi": { brand: "R", url: "https://www.rayavadee.com/" },
  "137-pillars-house": { brand: "137", url: "https://137pillarschangmai.com/" },
  "the-siam-bangkok": { brand: "TS", url: "https://www.thesiamhotel.com/" }
};

function Logo() {
  return <Link className="brand" to="/"><span className="brand-symbol">⌁</span><span>Explore <b>World</b><small>Global Destination Explorer</small></span></Link>;
}

function Header({ admin = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  }

  return (
    <header className={`topbar ${admin ? "topbar-admin" : ""}`}>
      <Logo />
      <nav className="main-nav" aria-label="Main navigation">
        <Link to="/">Home</Link>
        <Link to="/countries">Countries</Link>
        <Link to="/destinations">Destinations</Link>
        <Link className={location.pathname === "/hotels" ? "active" : ""} to="/hotels">Hotels</Link>
        <Link to="/about">About</Link>
      </nav>
      <div className="header-actions">
        <button type="button" aria-label="Search">⌕</button>
        <Link to="/admin/destinations" aria-label="Admin dashboard">◉</Link>
        <Link className="profile-dot" to="/admin/destinations">A</Link>
        {admin && <button className="logout-button" type="button" onClick={handleLogout}>Log out</button>}
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
  return <main className="app-shell"><Header /><section className="page-heading"><p className="kicker">Explore our countries</p><h1>Discover the <em>World</em></h1><p>From tropical beaches to majestic mountains, explore our handpicked countries.</p></section><section className="country-grid content-width">{countries.map((country) => <Link className="country-tile" to={`/countries/${country.slug}`} key={country.slug}>{country.image ? <img src={country.image} alt={`${country.name} landscape`} /> : <ImagePlaceholder />}<div><h2>{country.name}</h2><p>{country.tagline}</p></div></Link>)}</section></main>;
}

function HotelCard({ hotel }) {
  const official = hotelOfficialDetails[hotel.id];
  return (
    <article className="hotel-card">
      <div className="hotel-card-brand"><span className="hotel-brand-mark">{official.brand}</span><span className="hotel-type">{hotel.type}</span><span className="hotel-official-label">Official property</span></div>
      <div className="hotel-card-copy">
        <div className="hotel-card-heading"><div><p>{hotel.destination} · {hotel.country}</p><h2>{hotel.name}</h2></div><strong>★ {hotel.rating}</strong></div>
        <p className="hotel-description">{hotel.description}</p>
        <div className="hotel-amenities">{hotel.amenities.map((amenity) => <span key={amenity}>{amenity}</span>)}</div>
        <div className="hotel-card-footer"><span>Guide price from <b>${hotel.price}</b> / night</span><div><a href={official.url} target="_blank" rel="noreferrer">Official details ↗</a><Link to={`/destinations/${hotel.destinationId}`}>Explore area</Link></div></div>
      </div>
    </article>
  );
}

function Hotels() {
  const [country, setCountry] = useState("all");
  const [destination, setDestination] = useState("all");
  const [budget, setBudget] = useState("all");
  const [duration, setDuration] = useState("all");

  const destinationOptions = destinations.filter((item) => country === "all" || item.countrySlug === country);
  const filteredHotels = hotels.filter((hotel) => {
    const matchesCountry = country === "all" || hotel.countrySlug === country;
    const matchesDestination = destination === "all" || hotel.destinationId === destination;
    const matchesBudget = budget === "all"
      || (budget === "under-100" && hotel.price < 100)
      || (budget === "100-200" && hotel.price >= 100 && hotel.price <= 200)
      || (budget === "over-200" && hotel.price > 200);
    const matchesDuration = duration === "all"
      || (duration === "short" && hotel.stay[0] <= 1 && hotel.stay[1] >= 1)
      || (duration === "medium" && hotel.stay[0] <= 3 && hotel.stay[1] >= 2)
      || (duration === "long" && hotel.stay[0] <= 7 && hotel.stay[1] >= 4)
      || (duration === "extended" && hotel.stay[1] >= 8);
    return matchesCountry && matchesDestination && matchesBudget && matchesDuration;
  });

  function handleCountryChange(event) {
    setCountry(event.target.value);
    setDestination("all");
  }

  return (
    <main className="app-shell">
      <Header />
      <section className="page-heading hotels-heading"><p className="kicker">Stay well, travel further</p><h1>Find your <em>place.</em></h1><p>Comfortable stays near the destinations you want to explore, matched to your country, budget and trip length.</p></section>
      <section className="hotel-search content-width">
        <div className="hotel-search-row">
          <label>Country<select value={country} onChange={handleCountryChange}><option value="all">All countries</option>{countries.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label>
          <label>Near destination<select value={destination} onChange={(event) => setDestination(event.target.value)}><option value="all">Any destination</option>{destinationOptions.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
          <label>Nightly budget<select value={budget} onChange={(event) => setBudget(event.target.value)}><option value="all">Any budget</option><option value="under-100">Under $100</option><option value="100-200">$100 - $200</option><option value="over-200">Over $200</option></select></label>
          <label>Trip duration<select value={duration} onChange={(event) => setDuration(event.target.value)}><option value="all">Any duration</option><option value="short">1 night</option><option value="medium">2 - 3 nights</option><option value="long">4 - 7 nights</option><option value="extended">8+ nights</option></select></label>
        </div>
      </section>
      <section className="content-width hotel-results"><div className="hotel-results-heading"><p className="kicker">Curated stays</p><span>{filteredHotels.length} hotels found</span></div>{filteredHotels.length ? <div className="hotel-grid">{filteredHotels.map((hotel) => <HotelCard hotel={hotel} key={hotel.id} />)}</div> : <div className="hotel-empty"><h2>No stays match those filters.</h2><p>Try a wider budget or a shorter trip duration.</p></div>}</section>
    </main>
  );
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

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      await login(form);
      navigate("/admin/destinations");
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  return (
    <main
      className="auth-page"
      style={{ "--auth-background-image": `url(${galleImage})` }}
    >
      <div className="auth-panel">
        <Link className="auth-wordmark" to="/" aria-label="Explore World home">
          <span className="brand-symbol">⌁</span>
          <span>Explore <b>World</b></span>
        </Link>
        <p className="kicker">Welcome back</p>
        <h1>Continue your <em>journey.</em></h1>
        <p className="auth-intro">Sign in to keep exploring the places that inspire you.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>
          <input id="login-email" name="email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          <button className="lime-button" type="submit" disabled={status.loading}>{status.loading ? "Signing in..." : "Sign in"}</button>
        </form>
        {status.error && <p className="auth-notice" role="alert">{status.error}</p>}
        <p className="auth-account-link">New here? <Link to="/signup">Create an account</Link></p>
        <Link className="auth-back-link" to="/">← Back to Explore World</Link>
      </div>
    </main>
  );
}

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      await signup(form);
      navigate("/admin/destinations");
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  return (
    <main className="auth-page" style={{ "--auth-background-image": `url(${galleImage})` }}>
      <div className="auth-panel">
        <Link className="auth-wordmark" to="/" aria-label="Explore World home">
          <span className="brand-symbol">⌁</span>
          <span>Explore <b>World</b></span>
        </Link>
        <p className="kicker">Begin your journey</p>
        <h1>Create your <em>account.</em></h1>
        <p className="auth-intro">Save your places and keep your travels in one thoughtful space.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="signup-name">Name</label>
          <input id="signup-name" type="text" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <label htmlFor="signup-email">Email address</label>
          <input id="signup-email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <label htmlFor="signup-password">Password</label>
          <input id="signup-password" type="password" autoComplete="new-password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          <button className="lime-button" type="submit" disabled={status.loading}>{status.loading ? "Creating account..." : "Create account"}</button>
        </form>
        {status.error && <p className="auth-notice" role="alert">{status.error}</p>}
        <p className="auth-account-link">Already registered? <Link to="/login">Sign in</Link></p>
        <Link className="auth-back-link" to="/">← Back to Explore World</Link>
      </div>
    </main>
  );
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, authenticated: false });

  useEffect(() => {
    getCurrentUser()
      .then(() => setState({ loading: false, authenticated: true }))
      .catch(() => setState({ loading: false, authenticated: false }));
  }, []);

  if (state.loading) return <main className="auth-page"><p>Checking your session...</p></main>;
  if (!state.authenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
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
  return <Routes><Route path="/" element={<Homepage />} /><Route path="/login" element={<Login />} /><Route path="/signup" element={<Signup />} /><Route path="/countries" element={<Countries />} /><Route path="/countries/:countrySlug" element={<CountryDestinations />} /><Route path="/destinations" element={<CountryDestinations />} /><Route path="/destinations/:destinationId" element={<DestinationDetails />} /><Route path="/hotels" element={<Hotels />} /><Route path="/admin/destinations" element={<ProtectedRoute><Admin /></ProtectedRoute>} /><Route path="/about" element={<About />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}

export default App;
