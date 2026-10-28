import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  countryImage,
  destinationImages,
  normalizeSlug
} from "../data/destinationImages";
import { getDestinations } from "../services/destinationService";
import ImagePlaceholder from "./ImagePlaceholder";

// Keep the original country photography, descriptions, and order.
const featuredCountries = [
  {
    name: "Sri Lanka", slug: "sri-lanka", region: "South Asia",
    tagline: "Island rhythms and ancient trails",
    image: countryImage["sri-lanka"], alt: "Sigiriya rock fortress in Sri Lanka"
  },
  {
    name: "India", slug: "india", region: "South Asia",
    tagline: "History, culture and vivid landscapes",
    image: countryImage.india, alt: "Taj Mahal in India"
  },
  {
    name: "Thailand", slug: "thailand", region: "Southeast Asia",
    tagline: "Golden temples, turquoise mornings",
    image: countryImage.thailand, alt: "Phi Phi Islands in Thailand"
  },
  {
    name: "Nepal", slug: "nepal", region: "South Asia",
    tagline: "A higher perspective on wonder",
    image: countryImage.nepal, alt: "Mount Everest in Nepal"
  },
  {
    name: "Indonesia", slug: "indonesia", region: "Southeast Asia",
    tagline: "Where wild horizons meet warm seas",
    image: countryImage.indonesia, alt: "Kelingking Beach in Indonesia"
  }
];

const destinationNames = {
  goa: "Goa", "hawa-mahal": "Hawa Mahal",
  "kerala-backwaters": "Kerala Backwaters", "taj-mahal": "Taj Mahal",
  varanasi: "Varanasi",
  "bali-ubud-tegallalang-rice-terraces": "Tegallalang Rice Terraces",
  borobudur: "Borobudur Temple", "mount-bromo": "Mount Bromo",
  "nusa-penida-kelingking-beach": "Kelingking Beach",
  "raja-ampat-islands": "Raja Ampat Islands",
  "annapurna-range": "Annapurna Range",
  "kathmandu-boudhanath-stupa": "Boudhanath Stupa",
  lumbini: "Lumbini", "phewa-lake-serenity": "Phewa Lake",
  everest: "Mount Everest", galle: "Galle", mirissa: "Mirissa",
  "nine-arch-bridge": "Nine Arch Bridge", sigiriya: "Sigiriya",
  "temple-of-tooth-relic": "Temple of the Tooth",
  "bangkok-wat-arun": "Wat Arun", "chiang-mai-doi-suthep": "Doi Suthep",
  "krabi-railay-beach": "Railay Beach",
  "phi-phi-islands": "Phi Phi Islands",
  "phuket-patong-beach": "Patong Beach"
};

function useDatabaseDestinations() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await getDestinations();
        if (!Array.isArray(result)) throw new Error("Unexpected destination response");
        if (active) setRecords(result);
      } catch {
        if (active) setError("Could not load the latest destinations. Showing saved places where available.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  return { records, loading, error };
}

function CompassMark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /></span>;
}

function HomeWordmark() {
  return (
    <Link className="countries-wordmark" to="/" aria-label="Explore World home">
      <CompassMark />
      <span>Explore <strong>World</strong></span>
    </Link>
  );
}

function CountryList({ countries, loading, error }) {
  const [activeIndex, setActiveIndex] = useState(2);
  const count = countries.length;
  const currentIndex = count ? activeIndex % count : 0;

  const moveCarousel = (direction) => {
    setActiveIndex((current) => (current + direction + count) % count);
  };

  // Three cards on wide screens; works for one or two countries too.
  const visibleCountries = count === 0 ? [] : [-1, 0, 1].map((offset) => ({
    country: countries[(currentIndex + offset + count) % count],
    position: offset === -1 ? "previous" : offset === 0 ? "active" : "next"
  })).filter((entry, index, array) =>
    array.findIndex((other) => other.country.slug === entry.country.slug) === index
  );

  return (
    <main className="countries-page">
      <div className="countries-topbar"><HomeWordmark /></div>
      <header className="countries-header">
        <p className="eyebrow">Choose your horizon</p>
        <h1>Explore countries</h1>
        <p>Begin with a place that stays with you long after the journey ends.</p>
      </header>
      {error && <p role="status" className="countries-data-notice">{error}</p>}
      {loading && <p className="countries-data-notice">Loading new countries…</p>}
      <section className="country-carousel" aria-label="Countries to explore">
        <button className="country-carousel-arrow country-carousel-arrow-left"
          type="button" onClick={() => moveCarousel(-1)} disabled={count < 2}
          aria-label="Previous countries"><span aria-hidden="true">←</span></button>
        <div className="country-grid">
          {visibleCountries.map(({ country, position }) => (
            <article className={`country-card country-card-${position}`} key={country.slug}>
              <div className="country-image">
                {country.image ? <img src={country.image} alt={country.alt} loading="lazy" /> : <ImagePlaceholder />}
                <div className="country-card-shade" />
                <span className="country-index">
                  {String(countries.findIndex((item) => item.slug === country.slug) + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="country-card-content">
                <span>{country.region}</span><h2>{country.name}</h2><p>{country.tagline}</p>
                <Link className="country-explore-button" to={`/countries/${country.slug}`}>
                  Explore <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
        <button className="country-carousel-arrow country-carousel-arrow-right"
          type="button" onClick={() => moveCarousel(1)} disabled={count < 2}
          aria-label="Next countries"><span aria-hidden="true">→</span></button>
      </section>
    </main>
  );
}

function CountryDestinations({ countries, records, loading, error }) {
  const { countrySlug } = useParams();
  const slug = normalizeSlug(countrySlug);
  const country = countries.find((item) => item.slug === slug);

  const places = useMemo(() => {
    if (!country) return [];
    const staticPlaces = Object.entries(destinationImages[slug] || {}).map(([placeSlug, imageUrl]) => ({
      slug: placeSlug,
      name: destinationNames[placeSlug] || placeSlug.replace(/-/g, " "),
      image: imageUrl
    }));
    const bySlug = new Map(staticPlaces.map((place) => [normalizeSlug(place.name), place]));
    for (const item of records) {
      if (normalizeSlug(item.country || "") !== slug || !item.name?.trim()) continue;
      const key = normalizeSlug(item.name);
      const original = bySlug.get(key);
      bySlug.set(key, {
        slug: key,
        name: item.name,
        image: item.imageUrl || original?.image || ""
      });
    }
    return [...bySlug.values()];
  }, [country, records, slug]);

  if (!country) {
    if (loading) return <main className="country-placeholder-page"><p>Loading country…</p></main>;
    return (
      <main className="country-placeholder-page">
        <p className="eyebrow">Unknown destination</p>
        <h1>That journey is not on the map yet.</h1>
        <Link className="primary-button" to="/countries">Return to countries ↗</Link>
      </main>
    );
  }

  return (
    <main className="country-placeholder-page">
      <div className="countries-topbar"><HomeWordmark /></div>
      <header className="countries-header">
        <p className="eyebrow">{country.region}</p>
        <h1>{country.name}</h1>
        <p>{country.tagline}</p>
      </header>
      {error && <p role="status" className="countries-data-notice">{error}</p>}
      <section className="country-destinations-section">
        <h2>Places to explore</h2>
        {places.length === 0 && !loading && <p>No destinations have been added for this country yet.</p>}
        {places.length === 0 && loading && <p>Loading destinations…</p>}
        <div className="country-grid">
          {places.map((place) => (
            <article className="country-card" key={`${slug}-${place.slug}`}>
              <div className="country-image">
                {place.image ? <img src={place.image} alt={`${place.name}, ${country.name}`} loading="lazy" /> : <ImagePlaceholder />}
              </div>
              <div className="country-card-content">
                <span>{country.name}</span><h2>{place.name}</h2>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Link className="primary-button" to="/countries">← Explore other countries</Link>
    </main>
  );
}

function Countries() {
  const { countrySlug } = useParams();
  const { records, loading, error } = useDatabaseDestinations();
  const countries = useMemo(() => {
    const combined = new Map(featuredCountries.map((country) => [country.slug, country]));
    for (const item of records) {
      const name = item.country?.trim();
      if (!name) continue;
      const slug = normalizeSlug(name);
      if (!slug || combined.has(slug)) continue;
      combined.set(slug, {
        name, slug, region: "Explore the world",
        tagline: `Discover remarkable places in ${name}`,
        image: item.imageUrl || "",
        alt: `${name} travel destination`
      });
    }
    return [...combined.values()];
  }, [records]);

  return countrySlug
    ? <CountryDestinations countries={countries} records={records} loading={loading} error={error} />
    : <CountryList countries={countries} loading={loading} error={error} />;
}

export default Countries;
