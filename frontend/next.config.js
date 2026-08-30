/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: { unoptimized: true },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

export default nextConfig;
