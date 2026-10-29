import { Link } from "react-router-dom";

export default function BrandLogo({ to = "/", onClick } = {}) {
  return (
    <Link
      className="landing-wordmark"
      to={to}
      onClick={onClick}
      aria-label={to === "/admin" ? "Explore World admin dashboard" : "Explore World home"}
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