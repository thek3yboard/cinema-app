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
            destination: '/movies',
            permanent: true,
          },
        ]
    }
};

export default nextConfig;
