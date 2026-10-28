import { Link } from "react-router-dom";

export default function BrandLogo() {
  return (
    <Link
      className="landing-wordmark"
      to="/"
      aria-label="Explore World home"
    >
      <span className="landing-mark" aria-hidden="true">
        <span />
        <span />
      </span>

      <span>
        Explore <strong>World</strong>
      </span>
    </Link>
  );
}