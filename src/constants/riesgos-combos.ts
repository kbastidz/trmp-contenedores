// Constantes para el formulario de registro de riesgos
// Centraliza todos los combos y opciones del sistema TRM

// ── TIPOS DE RIESGO ─────────────────────────────────────────────────────────────
export const TIPOS_RIESGO = [
  'Seguridad industrial',
  'Operacional / Proceso',
  'Seguridad física',
  'Ambiental',
  'Tecnológico',
  'Humano / Fatiga',
  'Externo / Climático',
  'Legal / Regulatorio'
] as const;

// ── TURNOS ─────────────────────────────────────────────────────────────────────
export const TURNOS = [
  'Turno día',
  'Turno noche',
  'Todos los turnos'
] as const;

// ── NORMATIVAS APLICABLES ───────────────────────────────────────────────────────
export const NORMATIVAS = [
  'ISO 45001',
  'Código ISPS',
  'IMDG',
  'BASC',
  'ISO 31000'
] as const;

// ── PROBABILIDAD DE OCURRENCIA ───────────────────────────────────────────────────
export const PROBABILIDAD_OCURRENCIA = [
  { value: '1', label: '1 — Raro (menos de 1 vez al año)' },
  { value: '2', label: '2 — Improbable (1 vez al año)' },
  { value: '3', label: '3 — Posible (mensual)' },
  { value: '4', label: '4 — Probable (semanal)' },
  { value: '5', label: '5 — Casi seguro (diario)' }
] as const;

// ── NIVEL DE IMPACTO ─────────────────────────────────────────────────────────────
export const NIVEL_IMPACTO = [
  { value: '1', label: '1 — Insignificante (sin lesiones)' },
  { value: '2', label: '2 — Menor (primeros auxilios)' },
  { value: '3', label: '3 — Moderado (lesión con baja)' },
  { value: '4', label: '4 — Mayor (lesión grave / pérdida)' },
  { value: '5', label: '5 — Catastrófico (fatalidad)' }
] as const;

// ── ANTECEDENTES ───────────────────────────────────────────────────────────────
export const ANTECEDENTES = [
  'No hay antecedentes',
  'Sí, una vez',
  'Sí, varias veces',
  'Casi ocurrió (near miss)'
] as const;

// ── CONTROLES EXISTENTES ─────────────────────────────────────────────────────────
export interface ControlExistente {
  label: string;
  tipo: 'Preventivo' | 'Detectivo' | 'Correctivo';
}

export const CONTROLES_EXISTENTES: ControlExistente[] = [
  { label: 'Procedimiento operativo estándar (POE) documentado', tipo: 'Preventivo' },
  { label: 'Capacitación y entrenamiento del personal', tipo: 'Preventivo' },
  { label: 'Inspección preoperacional de equipos', tipo: 'Preventivo' },
  { label: 'Sistema de bloqueo/etiquetado (LOTO)', tipo: 'Preventivo' },
  { label: 'Equipo de protección personal (EPP)', tipo: 'Preventivo' },
  { label: 'Señalización y demarcación de zonas', tipo: 'Preventivo' },
  { label: 'Alarmas y sensores de seguridad', tipo: 'Detectivo' },
  { label: 'Rondas de supervisión y auditorías', tipo: 'Detectivo' },
  { label: 'Plan de emergencia y evacuación', tipo: 'Correctivo' }
] as const;

// ── PRIORIDADES ─────────────────────────────────────────────────────────────────
export const PRIORIDADES = [
  'Inmediata (24h)',
  'Alta (1 semana)',
  'Media (1 mes)',
  'Baja (trimestral)'
] as const;

// ── NIVELES DE RIESGO ───────────────────────────────────────────────────────────
export interface NivelRiesgo {
  label: string;
  color: string;
  minScore: number;
  maxScore: number;
}

export const NIVELES_RIESGO: NivelRiesgo[] = [
  { label: 'Bajo', color: 'green', minScore: 1, maxScore: 4 },
  { label: 'Medio', color: 'yellow', minScore: 5, maxScore: 9 },
  { label: 'Alto', color: 'orange', minScore: 10, maxScore: 16 },
  { label: 'Crítico', color: 'red', minScore: 17, maxScore: 25 }
] as const;

// ── UTILIDADES ───────────────────────────────────────────────────────────────────
export function getScoreInfo(score: number): NivelRiesgo | undefined {
  return NIVELES_RIESGO.find(nivel => score >= nivel.minScore && score <= nivel.maxScore);
}

// ── TIPOS PARA EXPORTACIÓN ───────────────────────────────────────────────────────
export type TipoRiesgo = typeof TIPOS_RIESGO[number];
export type Turno = typeof TURNOS[number];
export type Normativa = typeof NORMATIVAS[number];
export type Antecedente = typeof ANTECEDENTES[number];
export type Prioridad = typeof PRIORIDADES[number];
export type ProbabilidadOcurrencia = typeof PROBABILIDAD_OCURRENCIA[number];
export type NivelImpacto = typeof NIVEL_IMPACTO[number];
