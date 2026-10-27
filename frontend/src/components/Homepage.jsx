import { useState } from "react";
import { Link } from "react-router-dom";

const showcases = [
  {
    name: "Patagonia",
    region: "South America",
    detail: "Torres del Paine",
    image: "/images/homepage/patagonia.webp",
    alt: "Snow-capped peaks and blue lakes in Patagonia"
  },
  {
    name: "Iceland",
    region: "Europe",
    detail: "Glacier lagoons",
    image: "/images/homepage/iceland.webp",
    alt: "Turquoise ice cave glowing under the Icelandic sky"
  },
  {
    name: "Morocco",
    region: "Africa",
    detail: "Sahara trails",
    image: "/images/homepage/morocco.webp",
    alt: "Warm Moroccan architecture and a sunlit courtyard"
  }
];

function ArrowIcon({ direction }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d={direction === "next" ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7"} />
    </svg>
  );
}

function CompassMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

function Homepage() {
  const [activeIndex, setActiveIndex] = useState(0);

  function moveCarousel(direction) {
    setActiveIndex((current) => (
      (current + direction + showcases.length) % showcases.length
    ));
  }

  const visibleShowcases = showcases.map(
    (_, offset) => showcases[(activeIndex + offset) % showcases.length]
  );

  return (
    <section className="homepage">
      <div className="hero-shell">
        <div className="hero-backdrop" />

        <header className="site-nav">
          <Link className="wordmark" to="/" aria-label="Explore World home">
            <CompassMark />
            <span>Explore <strong>World</strong></span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <a href="#destination-library">Discover</a>
            <a href="#destination-library">Journeys</a>
            <a href="#destination-library">Experiences</a>
            <Link to="/countries">Destinations</Link>
          </nav>

          <Link className="nav-cta" to="/countries">Explore now <span aria-hidden="true">↗</span></Link>
        </header>

        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">A world beyond the ordinary</p>
            <h1>Wonders <em>of the</em> world</h1>
            <p className="hero-description">
              Curated journeys to the planet&apos;s most extraordinary places,
              blending wild beauty with meaningful discovery.
            </p>
            <Link className="primary-button" to="/countries">
              Explore destinations <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="showcase-area" aria-label="Featured destinations">
            <div className="showcase-heading">
              <span>Featured journeys</span>
              <span className="showcase-count">{String(activeIndex + 1).padStart(2, "0")} / 03</span>
            </div>
            <div className="showcase-rail">
              {visibleShowcases.map((destination, index) => (
                <article
                  className={`showcase-card ${index === 0 ? "is-active" : ""}`}
                  key={destination.name}
                >
                  <img src={destination.image} alt={destination.alt} />
                  <div className="card-shade" />
                  <div className="card-label">
                    <span>{destination.region}</span>
                    <h2>{destination.name}</h2>
                    <p>{destination.detail}</p>
                  </div>
                  <span className="card-index">0{(activeIndex + index) % 3 + 1}</span>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-footer">
          <div className="scroll-cue">
            <span className="scroll-line" />
            <span>Scroll to discover</span>
          </div>
          <div className="carousel-controls">
            <button type="button" onClick={() => moveCarousel(-1)} aria-label="Previous featured destination">
              <ArrowIcon direction="previous" />
            </button>
            <button type="button" onClick={() => moveCarousel(1)} aria-label="Next featured destination">
              <ArrowIcon direction="next" />
            </button>
          </div>
          <div className="pagination" aria-label="Featured destination pagination">
            {showcases.map((destination, index) => (
              <button
                type="button"
                key={destination.name}
                className={index === activeIndex ? "is-selected" : ""}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${destination.name}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Homepage;
