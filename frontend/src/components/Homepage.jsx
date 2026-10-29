import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import sigiriyaImage from "../assets/destinations/srilanka/sigiriya.jpg";
import galleImage from "../assets/destinations/srilanka/galle.jpg";
import mirissaImage from "../assets/destinations/srilanka/mirissa.jpg";
import nineArchesImage from "../assets/destinations/srilanka/nine-arc-bridge.jpg";
import tajMahalImage from "../assets/destinations/india/Taj Mahal.jpg";
import phewaLakeImage from "../assets/destinations/nepal/Phewa Lake Serenity.jpg";
import phiPhiImage from "../assets/destinations/thailand/Phi Phi Islands.jpg";

const heroDestinations = [
  {
    name: "Sigiriya",
    location: "Sri Lanka · Cultural Triangle",
    image: sigiriyaImage,
    alt: "Sigiriya rock fortress rising above the green landscape"
  },
  {
    name: "Galle",
    location: "Sri Lanka · Southern Coast",
    image: galleImage,
    alt: "Historic Galle Fort beside the Indian Ocean"
  },
  {
    name: "Mirissa",
    location: "Sri Lanka · Indian Ocean",
    image: mirissaImage,
    alt: "Tropical beach and turquoise water at Mirissa"
  },
  {
    name: "Ella",
    location: "Sri Lanka · Hill Country",
    image: nineArchesImage,
    alt: "Nine Arch Bridge surrounded by the green hills of Ella"
  }
];

const featuredDestinations = [
  { name: "Sigiriya", location: "Sri Lanka", image: sigiriyaImage, to: "/destinations/sigiriya" },
  { name: "Ella", location: "Sri Lanka", image: nineArchesImage, to: "/destinations/nine-arch-bridge" },
  { name: "Galle", location: "Sri Lanka", image: galleImage, to: "/destinations/galle" },
  { name: "Phi Phi Islands", location: "Thailand", image: phiPhiImage, to: "/destinations/phi-phi-islands" },
  { name: "Phewa Lake", location: "Nepal", image: phewaLakeImage, to: "/destinations/phewa-lake-serenity" },
  { name: "Taj Mahal", location: "India", image: tajMahalImage, to: "/destinations/taj-mahal" }
];

function CompassMark() {
  return (
    <span className="landing-mark" aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

function Homepage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    const revealElements = document.querySelectorAll(".landing-reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12 }
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    const timer = window.setInterval(() => {
      if (isCarouselPaused) return;
      setActiveIndex((current) => (current + 1) % heroDestinations.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isCarouselPaused]);

  const activeDestination = heroDestinations[activeIndex];
  const nextDestination = heroDestinations[(activeIndex + 1) % heroDestinations.length];

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="landing-wordmark" to="/" aria-label="Explore World home">
          <CompassMark />
          <span>Explore <strong>World</strong></span>
        </Link>

        <nav className="landing-links" aria-label="Main navigation">
          <Link className="is-current" to="/">Home</Link>
          <Link to="/destinations">Explore</Link>
          <Link to="/countries">Destinations</Link>
          <Link to="/about">About</Link>
        </nav>

        <div className="landing-actions">
          <Link className="landing-login" to="/login">Login</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy landing-reveal">
          <p className="landing-eyebrow">Travel slowly · See deeply</p>
          <h1><span>Explore</span><br /><span><em>the</em> World</span></h1>
          <p className="landing-description">
            Curated places, thoughtful journeys, and the kind of moments that
            stay with you long after you return home.
          </p>
          <div className="landing-hero-actions">
            <Link className="landing-primary-button" to="/countries">
              Start Exploring
            </Link>
          </div>
        </div>

        <div
          className="landing-editorial-visual landing-reveal"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
          onFocus={() => setIsCarouselPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsCarouselPaused(false);
          }}
        >
          <div className="landing-main-photo">
            <img key={activeDestination.image} src={activeDestination.image} alt={activeDestination.alt} />
            <div className="landing-photo-label">
              <span>Featured destination</span>
              <strong>{activeDestination.name}</strong>
              <small>{activeDestination.location}</small>
            </div>
          </div>
          <div className="landing-secondary-photo">
            <img key={nextDestination.image} src={nextDestination.image} alt={nextDestination.alt} />
            <span>{nextDestination.name}<br /><small>{nextDestination.location}</small></span>
          </div>
          <div className="landing-carousel-controls">
            <span>{String(activeIndex + 1).padStart(2, "0")} / {String(heroDestinations.length).padStart(2, "0")}</span>
          </div>
          <div className="landing-dots" aria-label="Featured destination pagination">
            {heroDestinations.map((destination, index) => (
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
      </section>

      <section className="landing-featured landing-reveal" id="featured-destinations" aria-labelledby="featured-heading">
        <div className="landing-featured-heading">
          <div>
            <p className="landing-eyebrow">Featured destinations</p>
            <h2 id="featured-heading">Inspiring places <em>around the world.</em></h2>
          </div>
          <Link className="landing-text-link" to="/countries">View all destinations <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="landing-featured-grid">
          {featuredDestinations.map((destination) => (
            <Link className="landing-featured-card" to={destination.to} key={destination.name}>
              <div className="landing-featured-image">
                <img src={destination.image} alt={`${destination.name}, ${destination.location}`} />
              </div>
              <div className="landing-featured-meta">
                <strong>{destination.name}</strong>
                <span>{destination.location}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Homepage;
