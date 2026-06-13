/**
 * Base path del sitio — coincide con el basePath de next.config.js.
 * Usar solo en fetch(), <img src> y href de <link> manuales.
 * next/image y next/link aplican el basePath automáticamente.
 */
export const BASE_PATH = '/trmp-contenedores';

export function assetUrl(path: string): string {
  return `${BASE_PATH}${path}`;
}
