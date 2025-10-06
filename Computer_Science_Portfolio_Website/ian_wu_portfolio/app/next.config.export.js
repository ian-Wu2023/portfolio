
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export for GitHub Pages
  distDir: 'build',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    unoptimized: true 
  },
  // Disable trailing slashes for better GitHub Pages compatibility
  trailingSlash: true,
};

module.exports = nextConfig;
