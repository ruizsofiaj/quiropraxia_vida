import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // En la demo (consultorio ficticio) las fotos, el video y el logo reales no se sirven aunque alguien conozca la dirección.
  async redirects() {
    if (process.env.DEMO_MODE !== "1") return [];
    return ["/brand/fotos.mp4", "/brand/hugo.jpg", "/brand/logo-marca.png", "/brand/logo-marca-claro.png"].map(
      (source) => ({ source, destination: "/", permanent: false }),
    );
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
