import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { countryImage } from "../data/destinationImages";
import ImagePlaceholder from "./ImagePlaceholder";

const countries = [
  {
    name: "Sri Lanka",
    slug: "sri-lanka",
    region: "South Asia",
    tagline: "Island rhythms and ancient trails",
    image: countryImage["sri-lanka"],
    alt: "Sigiriya rock fortress in Sri Lanka"
  },
  {
    name: "India",
    slug: "india",
    region: "South Asia",
    tagline: "History, culture and vivid landscapes",
    image: countryImage.india,
    alt: "Taj Mahal in India"
  },
  {
    name: "Thailand",
    slug: "thailand",
    region: "Southeast Asia",
    tagline: "Golden temples, turquoise mornings",
    image: countryImage.thailand,
    alt: "Phi Phi Islands in Thailand"
  },
  {
    name: "Nepal",
    slug: "nepal",
    region: "South Asia",
    tagline: "A higher perspective on wonder",
    image: countryImage.nepal,
    alt: "Mount Everest in Nepal"
  },
  {
    name: "Indonesia",
    slug: "indonesia",
    region: "Southeast Asia",
    tagline: "Where wild horizons meet warm seas",
    image: countryImage.indonesia,
    alt: "Kelingking Beach in Indonesia"
  },
  {
    name: "Sri Lanka",
    slug: "sri-lanka",
    region: "South Asia",
    tagline: "Island rhythms and ancient trails",
    image: null,
    alt: ""
  }
];

function CompassMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

function HomeWordmark() {
  return (
    <Link className="countries-wordmark" to="/" aria-label="Explore World home">
      <CompassMark />
      <span>Explore <strong>World</strong></span>
    </Link>
  );
}

function CountryList() {
  const [activeIndex, setActiveIndex] = useState(2);

  function moveCarousel(direction) {
    setActiveIndex((current) => (
      (current + direction + countries.length) % countries.length
    ));
  }

  const visibleCountries = [-1, 0, 1].map((offset) => ({
    country: countries[(activeIndex + offset + countries.length) % countries.length],
    position: offset === -1 ? "previous" : offset === 0 ? "active" : "next"
  }));

  return (
    <main className="countries-page">
      <div className="countries-topbar">
        <HomeWordmark />
      </div>
      <header className="countries-header">
        <p className="eyebrow">Choose your horizon</p>
        <h1>Explore countries</h1>
        <p>Begin with a place that stays with you long after the journey ends.</p>
      </header>

      <section className="country-carousel" aria-label="Countries to explore">
        <button
          className="country-carousel-arrow country-carousel-arrow-left"
          type="button"
          onClick={() => moveCarousel(-1)}
          aria-label="Previous countries"
        >
          <span aria-hidden="true">←</span>
        </button>

        <div className="country-grid">
        {visibleCountries.map(({ country, position }) => (
          <article className={`country-card country-card-${position}`} key={country.slug}>
            <div className="country-image">
              {country.image ? <img src={country.image} alt={country.alt} /> : <ImagePlaceholder />}
              <div className="country-card-shade" />
              <span className="country-index">0{countries.indexOf(country) + 1}</span>
            </div>
            <div className="country-card-content">
              <span>{country.region}</span>
              <h2>{country.name}</h2>
              <p>{country.tagline}</p>
              <Link className="country-explore-button" to={`/countries/${country.slug}`}>
                Explore <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
        ))}
        </div>

        <button
          className="country-carousel-arrow country-carousel-arrow-right"
          type="button"
          onClick={() => moveCarousel(1)}
          aria-label="Next countries"
        >
          <span aria-hidden="true">→</span>
        </button>
      </section>
    </main>
  );
}

function CountryDestinations() {
  const { countrySlug } = useParams();
  const country = countries.find((item) => item.slug === countrySlug);

  if (!country) {
    return (
      <main className="country-placeholder-page">
        <p className="eyebrow">Unknown destination</p>
        <h1>That journey is not on the map yet.</h1>
        <Link className="primary-button" to="/countries">Return to countries <span aria-hidden="true">↗</span></Link>
      </main>
    );
  }

  return (
    <main className="country-placeholder-page">
      <div className="countries-topbar">
        <HomeWordmark />
      </div>
      <p className="eyebrow">Your next chapter</p>
      <h1>{country.name}</h1>
      <p>Destinations for {country.name} are coming soon. The journey starts here.</p>
      <Link className="primary-button" to="/">Return home <span aria-hidden="true">↗</span></Link>
    </main>
  );
}

function Countries() {
  const { countrySlug } = useParams();
  return countrySlug ? <CountryDestinations /> : <CountryList />;
}

export default Countries;
