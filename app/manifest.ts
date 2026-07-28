import type { MetadataRoute } from "next";

// uygulama ikonlarını tarayıcıya bildiriyorum
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stallcons Steel Construction",
    short_name: "Stallcons",
    description:
      "Tasarım, imalat, montaj ve mühendislik alanlarında çelik konstrüksiyon çözümleri.",
    start_url: "/tr",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1E50A0",
    icons: [
      {
        src: "/brand/favicon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/favicon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/brand/pwa-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
