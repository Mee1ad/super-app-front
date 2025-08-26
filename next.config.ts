import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Allow production builds to succeed even if there are ESLint errors.
    // We still run ESLint in CI/test, but don't block `next build`.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to succeed even if there are type errors.
    // Keep strictness during dev and CI.
    ignoreBuildErrors: true,
  },
  
  // Note: serverActions.bodySizeLimit is not supported in Next.js 15
  // File upload size limits should be handled in API routes
  
  // Note: sentry configuration should be handled via @sentry/nextjs plugin
  // or environment variables
};

export default nextConfig;
