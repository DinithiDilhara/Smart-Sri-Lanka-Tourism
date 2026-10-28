import { useEffect, useState } from "react";
import { getDestinations } from "../services/destinationService";
import {
  getDestinationImage,
  normalizeSlug
} from "../data/destinationImages";

let destinationsCache = null;
let destinationsRequest = null;

export function useDestinations() {
  const [state, setState] = useState(() => ({
    destinations: destinationsCache || [],
    loading: !destinationsCache,
    error: ""
  }));

  useEffect(() => {
    let cancelled = false;

    async function loadDestinations() {
      try {
        if (destinationsCache) {
          return;
        }

        if (!destinationsRequest) {
          destinationsRequest = getDestinations();
        }

        const data = await destinationsRequest;

        if (!Array.isArray(data)) {
          throw new Error("Invalid destinations response");
        }

        const mapped = data.map((item) => {
          const countrySlug = normalizeSlug(item.country);
          const slug = normalizeSlug(item.slug || item.name);

          return {
            ...item,
            id: slug,
            slug,
            countrySlug,
            image:
              getDestinationImage(countrySlug, slug) ||
              item.imageUrl ||
              null,
            facts: [
              item.district,
              item.category
            ].filter(Boolean)
          };
        }).filter((item, index, items) => (
          items.findIndex((candidate) => (
            candidate.countrySlug === item.countrySlug &&
            candidate.slug === item.slug
          )) === index
        ));

        destinationsCache = mapped;

        if (!cancelled) {
          setState({ destinations: mapped, loading: false, error: "" });
        }
      } catch (err) {
        destinationsRequest = null;
        if (!cancelled) {
          setState({
            destinations: [],
            loading: false,
            error: err instanceof Error ? err.message : "Unable to load destinations"
          });
        }
      }
    }

    loadDestinations();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
