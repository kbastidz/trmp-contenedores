// ── Entidades base ────────────────────────────────────────────────────────────

export interface TerminalDto {
  id: string;
  nombre: string;
  codigo: string;
  ubicacion?: string;
  activa: boolean;
}

export interface AreaDto {
  id: string;
  nombre: string;
  descripcion?: string;
  terminal_id: string;
  activa: boolean;
}

// ── Riesgos ───────────────────────────────────────────────────────────────────

export type NivelRiesgo = 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
export type EstadoRiesgo = 'Activo' | 'En revisión' | 'En mitigación' | 'Aceptado' | 'Cerrado';

export interface PlanResumen {
  id: string;
  codigo: string;
  titulo: string;
  progreso: number;
  estado: string;
}

export interface RiesgoDto {
  id: string;
  terminal_id: string;
  area_id?: string;
  responsable_id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  causa?: string;
  categoria?: string;
  probabilidad: number;
  impacto: number;
  nivel: NivelRiesgo;
  estado: EstadoRiesgo;
  responsable?: string;
  area?: string;
  ultima_revision?: string;
  planes?: PlanResumen[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRiesgoPayload {
  terminal_id: string;
  area_id?: string;
  responsable_id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  causa?: string;
  categoria?: string;
  probabilidad: number;
  impacto: number;
  nivel: NivelRiesgo;
  estado: EstadoRiesgo;
}

export interface UpdateRiesgoPayload {
  nombre?: string;
  descripcion?: string;
  causa?: string;
  categoria?: string;
  probabilidad?: number;
  impacto?: number;
  nivel?: NivelRiesgo;
  estado?: EstadoRiesgo;
  justificacion_cambio_estado?: string;
}

export interface HistorialEstadoDto {
  id: string;
  estado_anterior: string;
  estado_nuevo: string;
  justificacion?: string;
  fecha: string;
  usuario?: string;
}
