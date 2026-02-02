/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // Static export for Netlify
    trailingSlash: true,
    images: {
        unoptimized: true, // Required for static export
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    },
};

module.exports = nextConfig;
