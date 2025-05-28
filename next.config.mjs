import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['tmdb.org', 'themoviedb.org', 'image.tmdb.org'],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
    NEXT_PUBLIC_TMDB_BEARER_TOKEN: process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en-US/movies',
        permanent: true,
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'clsx/dist/clsx.m.js': 'clsx' // ✅ Fix bad path by redirecting
    };
    return config;
  },
  // Dangerously allow production builds to complete even with type errors
  typescript: {
    // Set this to false if you want to ignore TypeScript errors
    ignoreBuildErrors: true,
  }
};
 
export default withNextIntl(nextConfig);