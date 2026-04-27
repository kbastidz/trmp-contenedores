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

// ── Planes ────────────────────────────────────────────────────────────────────

export type EstadoPlan = 'Pendiente' | 'En progreso' | 'Completado' | 'Vencido' | 'Cancelado';

export interface PlanDto {
  id: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  objetivo?: string;
  estado: EstadoPlan;
  progreso: number;
  fecha_inicio?: string;
  fecha_limite?: string;
  fecha_revision?: string;
  responsable?: string;
  responsable_id?: string;
  aprobador?: string;
  area?: string;
  tipo_control?: string;
  estrategia?: string;
  indicador?: string;
  observaciones?: string;
  riesgo_id?: string;
  terminal_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlanPayload {
  terminal_id: string;
  riesgo_id?: string;
  responsable_id?: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  objetivo?: string;
  estado: EstadoPlan;
  progreso: number;
  fecha_inicio?: string;
  fecha_limite: string;
  tipo_control?: string;
  estrategia?: string;
  indicador?: string;
}

export interface UpdatePlanPayload {
  titulo?: string;
  descripcion?: string;
  objetivo?: string;
  estado?: EstadoPlan;
  progreso?: number;
  fecha_inicio?: string;
  fecha_limite?: string;
  fecha_revision?: string;
  tipo_control?: string;
  estrategia?: string;
  indicador?: string;
  observaciones?: string;
}

export interface AvancePlanPayload {
  progreso_nuevo: number;
  estado_nuevo: EstadoPlan;
  nota?: string;
  nombre_usuario?: string;
}

export interface HistorialAvanceDto {
  id: string;
  progreso_anterior: number;
  progreso_nuevo: number;
  estado_anterior: string;
  estado_nuevo: string;
  nota?: string;
  nombre_usuario?: string;
  fecha: string;
}

// ── Incidentes ────────────────────────────────────────────────────────────────

export type SeveridadIncidente = 'Leve' | 'Moderado' | 'Grave' | 'Crítico';
export type EstadoIncidente = 'Abierto' | 'En análisis' | 'Con plan' | 'Cerrado';

export interface IncidenteDto {
  id: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  severidad: SeveridadIncidente;
  estado: EstadoIncidente;
  fecha_ocurrencia?: string;
  hora_ocurrencia?: string;
  area?: string;
  area_id?: string;
  turno?: string;
  equipo_involucrado?: string;
  responsable?: string;
  responsable_id?: string;
  causa_inmediata?: string;
  causa_raiz?: string;
  lecciones_aprendidas?: string;
  acciones_inmediatas?: string;
  observaciones_internas?: string;
  motivo_cierre?: string;
  riesgo_id?: string;
  terminal_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIncidentePayload {
  terminal_id: string;
  area_id?: string;
  responsable_id?: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  severidad: SeveridadIncidente;
  estado: EstadoIncidente;
  fecha_ocurrencia: string;
  hora_ocurrencia?: string;
  turno?: string;
  equipo_involucrado?: string;
  causa_inmediata?: string;
  causa_raiz?: string;
  lecciones_aprendidas?: string;
  acciones_inmediatas?: string;
  riesgo_id?: string;
}

export interface UpdateIncidentePayload {
  titulo?: string;
  descripcion?: string;
  severidad?: SeveridadIncidente;
  estado?: EstadoIncidente;
  fecha_ocurrencia?: string;
  hora_ocurrencia?: string;
  turno?: string;
  equipo_involucrado?: string;
  causa_inmediata?: string;
  causa_raiz?: string;
  lecciones_aprendidas?: string;
  acciones_inmediatas?: string;
  observaciones_internas?: string;
  motivo_cierre?: string;
}

// ── Controles ─────────────────────────────────────────────────────────────────

export interface ControlDto {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  activo: boolean;
  efectivo?: boolean;
  observaciones?: string;
}

// ── KRI ───────────────────────────────────────────────────────────────────────

export interface KriDto {
  id: string;
  nombre: string;
  descripcion?: string;
  unidad?: string;
  umbral_alerta?: number;
  umbral_critico?: number;
  activo: boolean;
  ultimo_valor?: number;
  ultimo_estado?: string;
  terminal_id?: string;
}

// ── Escalamientos ─────────────────────────────────────────────────────────────

export type UrgenciaEscalamiento = 'Normal' | 'Alta' | 'Crítica';
export type EstadoEscalamiento = 'Enviado' | 'Respondido' | 'Cerrado';

export interface EscalamientoDto {
  id: string;
  codigo: string;
  terminal_id?: string;
  creado_por?: string;
  motivo: string;
  urgencia: UrgenciaEscalamiento;
  estado: EstadoEscalamiento;
  nivel_escalamiento: number;
  auto_generado: boolean;
  contexto?: string;
  recursos_requeridos?: string;
  nueva_fecha_propuesta?: string;
  canal?: string;
  respuesta_texto?: string;
  respuesta_autor?: string;
  respuesta_usuario_id?: string;
  respuesta_fecha?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEscalamientoPayload {
  terminal_id: string;
  creado_por?: string;
  codigo: string;
  motivo: string;
  urgencia: UrgenciaEscalamiento;
  estado: EstadoEscalamiento;
  nivel_escalamiento: number;
  auto_generado: boolean;
  contexto?: string;
  recursos_requeridos?: string;
  nueva_fecha_propuesta?: string;
  canal?: string;
}

export interface ResponderEscalamientoPayload {
  respuesta_texto: string;
  respuesta_autor: string;
  respuesta_usuario_id?: string;
}
