import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Note: serverActions.bodySizeLimit is not supported in Next.js 15
  // File upload size limits should be handled in API routes
  
  // Note: sentry configuration should be handled via @sentry/nextjs plugin
  // or environment variables
};

export default nextConfig;
