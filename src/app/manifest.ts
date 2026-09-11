import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "daffodilz Atelier",
    short_name: "Atelier",
    description:
      "Boutique management app for daffodilz — track custom work orders, status and payments.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f1e4",
    theme_color: "#0f241a",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
