import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const apiUrl =
  process.env.VITE_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  env: apiUrl
    ? {
        VITE_API_URL: apiUrl,
      }
    : undefined,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
