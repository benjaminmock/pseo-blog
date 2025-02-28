/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    domains: [],
    unoptimized: true, // Since we're using local images
  },
};

export default nextConfig;
