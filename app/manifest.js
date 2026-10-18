export default function manifest() {
  return {
    id: "/",
    name: "BetiShop — Shop Management",
    short_name: "BetiShop",
    description: "Manage your products, inventory, sales, and shop finances.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#f8fafc",
    theme_color: "#172554",
    icons: [
      { src: "/icons/betishop-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icons/betishop-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  };
}
