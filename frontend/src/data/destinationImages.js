const imageModules = import.meta.glob(
  "../assets/destinations/**/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default", query: "?url" }
);

const image = (country, filename) => (
  imageModules[`../assets/destinations/${country}/${filename}`] || null
);

export const destinationImages = {
  india: {
    goa: image("india", "Goa.jpg"),
    "hawa-mahal": image("india", "Hawa Mahal.jpg"),
    "kerala-backwaters": image("india", "Kerala Backwaters.jpg"),
    "taj-mahal": image("india", "Taj Mahal.jpg"),
    varanasi: image("india", "Varanasi.jpg")
  },
  indonesia: {
    "bali-ubud-tegallalang-rice-terraces": image("indonesia", "Bali Ubud Tegallalang rice terraces.jpg"),
    borobudur: image("indonesia", "Borobudur Temple.jpg"),
    "mount-bromo": image("indonesia", "Mount Bromo.jpg"),
    "nusa-penida-kelingking-beach": image("indonesia", "Nusa Penida – Kelingking Beach.jpg"),
    "raja-ampat-islands": image("indonesia", "Raja Ampat Islands.jpg")
  },
  nepal: {
    "annapurna-range": image("nepal", "Annapurna Range.jpg"),
    "kathmandu-boudhanath-stupa": image("nepal", "Kathmandu – Boudhanath Stupa.jpg"),
    lumbini: image("nepal", "Lumbini.jpg"),
    "phewa-lake-serenity": image("nepal", "Phewa Lake Serenity.jpg"),
    everest: image("nepal", "everast.jpg")
  },
  "sri-lanka": {
    galle: image("srilanka", "galle.jpg"),
    mirissa: image("srilanka", "mirissa.jpg"),
    "nine-arch-bridge": image("srilanka", "nine-arc-bridge.jpg"),
    sigiriya: image("srilanka", "sigiriya.jpg"),
    "temple-of-tooth-relic": image("srilanka", "temple-of-tooth-relic.jpg")
  },
  thailand: {
    "bangkok-wat-arun": image("thailand", "Bangkok – Wat Arun.jpg"),
    "chiang-mai-doi-suthep": image("thailand", "Chiang Mai – Doi Suthep.jpg"),
    "krabi-railay-beach": image("thailand", "Krabi – Railay Beach.jpg"),
    "phi-phi-islands": image("thailand", "Phi Phi Islands.jpg"),
    "phuket-patong-beach": image("thailand", "Phuket – Patong Beach.jpg")
  }
};

export const countryImage = {
  india: destinationImages.india["taj-mahal"],
  indonesia: destinationImages.indonesia["nusa-penida-kelingking-beach"],
  nepal: destinationImages.nepal.everest,
  "sri-lanka": destinationImages["sri-lanka"].sigiriya,
  thailand: destinationImages.thailand["phi-phi-islands"]
};

export function normalizeSlug(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function getDestinationImage(countrySlug, placeSlug) {
  return destinationImages[normalizeSlug(countrySlug)]?.[normalizeSlug(placeSlug)] || null;
}
