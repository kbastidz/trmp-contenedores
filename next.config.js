/** @type {import('next').NextConfig} */

// En GitHub Actions se inyecta GITHUB_ACTIONS=true automáticamente
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const basePath = isGitHubPages ? '/trmp-contenedores' : '';

// Exponemos el basePath al bundle del cliente para que los helpers de assets lo usen
process.env.NEXT_PUBLIC_BASE_PATH = basePath;

const nextConfig = {
  // Static export para GitHub Pages
  output: 'export',

  basePath,
  assetPrefix: basePath,

  reactStrictMode: true,
  trailingSlash: true,

  // Requerido para export estático
  images: {
    unoptimized: true,
  },

  // Turbopack config vacío para silenciar advertencias
  turbopack: {},

  // Enable React Compiler (stable in Next.js 16)
  reactCompiler: true,
};

module.exports = nextConfig;
