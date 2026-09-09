import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot  = path.resolve(__dirname, "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — generates web/out/ with a proper index.html
  // Required for Firebase Hosting free tier (no SSR)
  output: "export",
  trailingSlash: true,

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@shared": path.resolve(repoRoot, "shared"),
    };
    config.resolve.modules = [
      ...(config.resolve.modules || ["node_modules"]),
      path.resolve(repoRoot, "node_modules"),
    ];
    return config;
  },

  images: {
    unoptimized: true, // required for static export
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "graph.facebook.com" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
