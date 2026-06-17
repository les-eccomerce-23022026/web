/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rewrite /api requests to backend Express server
  // This maintains same-origin for HttpOnly cookies
  async redirects() {
    return [
      { source: '/login', destination: '/minha-conta', permanent: true },
      { source: '/registro', destination: '/minha-conta', permanent: true },
      { source: '/cadastro', destination: '/minha-conta', permanent: true },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
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
  // Allow dev origins for browser preview/proxy
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // Disable development indicators
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
};

export default nextConfig;
