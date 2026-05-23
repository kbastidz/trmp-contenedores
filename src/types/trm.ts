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

export interface EquipoDto {
  id: string;
  nombre: string;
  codigo?: string;
  tipo?: string;
  terminal_id: string;
  activo: boolean;
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
  responsable_accion_id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  causa?: string;
  categoria?: string;
  probabilidad: number;
  impacto: number;
  nivel: NivelRiesgo;
  estado: EstadoRiesgo;
  // campos populados por JOIN en el backend
  responsable_nombre?: string;       // user.name del responsable_id
  responsable_accion_nombre?: string; // user.name del responsable_accion_id
  area?: string;              // areas.nombre del area_id
  area_nombre?: string;       // alias alternativo
  terminal_nombre?: string;   // terminal.nombre del terminal_id
  ultima_revision?: string;
  planes?: PlanResumen[];
  controles?: RiesgoControlDto[];  // controles vinculados al riesgo
  createdAt?: string;
  updatedAt?: string;
  tiene_plan?: boolean;
}

export interface CreateRiesgoPayload {
  terminal_id: string;
  area_id?: string;
  responsable_id?: string;
  responsable_accion_id?: string;
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
  responsable_id?: string;
  responsable_accion_id?: string;
}

export interface HistorialEstadoDto {
  id: string;
  estado_anterior: string;
  estado_nuevo: string;
  justificacion?: string;
  fecha?: string;       // alias frontend
  creado_en?: string;   // nombre real en el backend
  usuario?: string;
}

// ── Planes ────────────────────────────────────────────────────────────────────

export type EstadoPlan = 'Pendiente' | 'En progreso' | 'Completado' | 'Vencido' | 'Cancelado';
export type EstadoTarea = 'Pendiente' | 'En ejecución' | 'Completada';

export interface TareaDto {
  id: string;
  plan_id: string;
  descripcion: string;
  responsable?: string;
  fecha_limite?: string;
  estado: EstadoTarea;
  orden?: number;
  creado_en?: string;
}

export interface CreateTareaPayload {
  descripcion: string;
  responsable?: string;
  fecha_limite?: string;
  estado?: EstadoTarea;
  orden?: number;
}

export interface UpdateTareaPayload {
  descripcion?: string;
  responsable?: string;
  fecha_limite?: string;
  estado?: EstadoTarea;
  orden?: number;
}

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
  responsable_id?: string;
  aprobador?: string;
  norma?: string;
  area_id?: string;
  tipo_control?: string;
  estrategia?: string;
  indicador?: string;
  observaciones?: string;
  riesgo_id?: string;
  terminal_id?: string;
  // campos populados por JOIN en el backend
  responsable_nombre?: string; // user.name del responsable_id
  area?: string;            // areas.nombre del area_id
  area_nombre?: string;     // alias alternativo
  riesgo_codigo?: string;   // riesgos.codigo del riesgo_id
  riesgo_nombre?: string;   // riesgos.nombre del riesgo_id
  terminal_nombre?: string; // terminal.nombre del terminal_id
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
  area_id?: string;
  aprobador?: string;
  norma?: string;
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
  area_id?: string;
  aprobador?: string;
  norma?: string;
  responsable?: string;
  presupuesto?: string;
  fuente_financiamiento?: string;
  prioridad?: string;
  recursos_adicionales?: string;
  justificacion_cambio?: string;
  evidencia_cierre?: string;
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
  fecha?: string;       // alias frontend
  creado_en?: string;   // nombre real en el backend
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
  area_id?: string;
  turno?: string;
  equipo_involucrado?: string;
  responsable_id?: string;
  causa_inmediata?: string;
  causa_raiz?: string;
  factores_contribuyentes?: string; // JSON array serializado: '["Factor 1","Factor 2"]'
  lecciones_aprendidas?: string;
  acciones_inmediatas?: string;
  observaciones_internas?: string;
  motivo_cierre?: string;
  riesgo_id?: string;
  terminal_id?: string;
  // campos populados por JOIN en el backend
  responsable_nombre?: string;       // user.name del responsable_id
  area?: string;              // areas.nombre del area_id
  area_nombre?: string;       // alias alternativo
  equipo_nombre?: string;     // equipos.nombre del equipo_id
  terminal_nombre?: string;   // terminal.nombre del terminal_id
  riesgo_codigo?: string;     // riesgos.codigo del riesgo_id
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIncidentePayload {
  terminal_id: string;
  area_id?: string;
  equipo_id?: string;
  responsable_id?: string;
  reportado_por?: string;
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
  factores_contribuyentes?: string; // JSON array serializado: '["Factor 1","Factor 2"]'
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
  area_id?: string;
  equipo_id?: string;
  turno?: string;
  equipo_involucrado?: string;
  causa_inmediata?: string;
  causa_raiz?: string;
  factores_contribuyentes?: string; // JSON array serializado: '["Factor 1","Factor 2"]'
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

// ── Relación Riesgo-Control ─────────────────────────────────────────────────────

export interface RiesgoControlDto {
  id: string;
  riesgo_id: string;
  control_id: string;
  efectivo: boolean;
  observaciones?: string;
  evaluado_en?: string;
  // campos populados por JOIN
  control_nombre?: string;
  control_tipo?: string;
  control_descripcion?: string;
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

export type UrgenciaEscalamiento = 'Normal' | 'Alta' | 'Critica';
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
  // campos populados por JOIN en el backend
  creado_por_nombre?: string; // user.name del creado_por
  terminal_nombre?: string;   // terminal.nombre del terminal_id
  createdAt?: string;
  updatedAt?: string;
  creado_en?: string;
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

// ── Acciones Correctivas ─────────────────────────────────────────────────────────

export type EstadoAccion = 'Pendiente' | 'En progreso' | 'Completada';
export type PrioridadAccion = 'Inmediata (24h)' | 'Alta (1 semana)' | 'Media (1 mes)' | 'Baja (trimestral)';

export interface AccionDto {
  id: string;
  terminal_id: string;
  responsable_id?: string;
  titulo: string;
  descripcion?: string;
  estado: EstadoAccion;
  fecha_limite?: string;
  prioridad: PrioridadAccion;
  riesgo_id?: string;
  escalamiento_id?: string;
  // campos populados por JOIN en el backend
  responsable_nombre?: string;
  riesgo_codigo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAccionPayload {
  terminal_id: string;
  responsable_id?: string;
  titulo: string;
  descripcion?: string;
  estado: EstadoAccion;
  fecha_limite?: string;
  prioridad: PrioridadAccion;
  riesgo_id?: string;
  escalamiento_id?: string;
}

export interface UpdateAccionPayload {
  titulo?: string;
  descripcion?: string;
  estado?: EstadoAccion;
  fecha_limite?: string;
  prioridad?: PrioridadAccion;
}

// ── Comentarios ─────────────────────────────────────────────────────────────────

export interface ComentarioDto {
  id: string;
  terminal_id: string;
  entidad_tipo: string;
  entidad_id: string;
  texto: string;
  visible_para?: string;
  autor_id?: string;
  nombre_autor?: string;
  createdAt?: string;
}

export interface CreateComentarioPayload {
  terminal_id: string;
  entidad_tipo: string;
  entidad_id: string;
  texto: string;
  visible_para?: string;
  autor_id?: string;
  nombre_autor?: string;
}

// ── Notificaciones ───────────────────────────────────────────────────────────────

export interface NotificacionDto {
  id: string;
  usuario_id: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  entidad_tipo?: string;
  entidad_id?: string;
  createdAt?: string;
}

// ── Valores KRI ─────────────────────────────────────────────────────────────────

export interface KriValorDto {
  id: string;
  kri_id: string;
  terminal_id: string;
  periodo: string;
  valor: number;
  estado: string;
  registrado_por?: string;
  creado_en?: string;
}

export interface CreateKriValorPayload {
  terminal_id: string;
  periodo: string;
  valor: number;
  estado: string;
  registrado_por?: string;
}
