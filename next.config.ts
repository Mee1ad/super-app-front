import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Server Actions configuration for file uploads
  serverActions: {
    bodySizeLimit: '10mb'
  },
  
  // Sentry configuration
  sentry: {
    // Suppresses source map uploading logs during build
    hideSourceMaps: true,
    
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  },
};

export default nextConfig;
