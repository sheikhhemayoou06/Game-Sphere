import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // Determine the backend URL based on the environment
    // Use NEXT_PUBLIC_API_URL if defined, otherwise fallback to localhost for development
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    // In production, we assume the backend is hosted elsewhere, 
    // or the frontend talks directly to it. If it's a unified deployment,
    // the rewrite might point to a production domain.
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/:path*`, // ensure no trailing slash
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
