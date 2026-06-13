/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',

  // Hardcodeado — Turbopack requiere string literal para basePath, no variable
  basePath: '/trmp-contenedores',
  assetPrefix: '/trmp-contenedores',

  reactStrictMode: true,
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  turbopack: {},
  reactCompiler: true,
};

module.exports = nextConfig;
