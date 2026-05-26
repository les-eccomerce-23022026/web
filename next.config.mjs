/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rewrite /api requests to backend Express server
  // This maintains same-origin for HttpOnly cookies
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  // Enable experimental features for App Router
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react'],
  },
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Static optimization for better performance
  output: 'standalone',
};

export default nextConfig;
