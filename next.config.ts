import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node:sqlite is used in server components / route handlers
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
