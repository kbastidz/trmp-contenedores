/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export para GitHub Pages
  output: 'export',

  // Nombre del repositorio como base path para GitHub Pages
  // https://kbastidz.github.io/trmp-contenedores/
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ?? '',

  reactStrictMode: true,
  trailingSlash: true,

  // Requerido para export estático (Next.js Image Optimization no funciona sin servidor)
  images: {
    unoptimized: true,
  },

  // Turbopack config vacío para silenciar advertencias
  turbopack: {},

  // Enable React Compiler (stable in Next.js 16)
  reactCompiler: true,
};

module.exports = nextConfig;
