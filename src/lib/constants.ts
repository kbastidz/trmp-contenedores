// Configuración global de la terminal activa
// TODO: reemplazar por valor dinámico desde sesión/contexto cuando esté disponible
export const TERMINAL_ID = 'b448580a-493c-470e-80e2-7bb83e8a4053';

// Base path para assets estáticos — en GitHub Pages es /trmp-contenedores, en local es ''
// Los componentes <Image> de Next.js y <Link> ya aplican el basePath automáticamente.
// Usar este helper solo con <img src>, fetch('/mocks/...'), href en <link>, etc.
export function assetUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
}
