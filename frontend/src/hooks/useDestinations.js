import { useEffect, useState } from "react";
import { getDestinations } from "../services/destinationService";
import {
  getDestinationImage,
  normalizeSlug
} from "../data/destinationImages";

export function useDestinations() {
  const [state, setState] = useState({
    destinations: [],
    loading: true,
    error: ""
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDestinations() {
      try {
        const data = await getDestinations();

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
              item.imageUrl ||
              getDestinationImage(countrySlug, slug) ||
              null,
            facts: [
              item.district,
              item.category
            ].filter(Boolean)
          };
        }).filter((item, index, items) =>
          items.findIndex(candidate =>
            candidate.countrySlug === item.countrySlug &&
            candidate.slug === item.slug
          ) === index
        );

        if (!cancelled) {
          setState({
            destinations: mapped,
            loading: false,
            error: ""
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            destinations: [],
            loading: false,
            error: error.message || "Unable to load destinations"
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
