import type {
  RiesgoDto,
  CreateRiesgoPayload,
  UpdateRiesgoPayload,
  HistorialEstadoDto,
  TerminalDto,
  AreaDto,
  EquipoDto,
  PlanDto,
  CreatePlanPayload,
  UpdatePlanPayload,
  AvancePlanPayload,
  HistorialAvanceDto,
  TareaDto,
  CreateTareaPayload,
  UpdateTareaPayload,
  IncidenteDto,
  CreateIncidentePayload,
  UpdateIncidentePayload,
  ControlDto,
  KriDto,
  EscalamientoDto,
  CreateEscalamientoPayload,
  ResponderEscalamientoPayload,
  AccionDto,
  CreateAccionPayload,
  UpdateAccionPayload,
  ComentarioDto,
  CreateComentarioPayload,
  NotificacionDto,
  KriValorDto,
  CreateKriValorPayload,
} from '@/types/trm';
import { getStoredToken } from '@/lib/auth';

// En static export no hay servidor Next.js, así que siempre llamamos directo al backend.
const TRM_API = process.env.NEXT_PUBLIC_TRM_API_URL ?? 'http://localhost:3002';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method ?? 'GET';
  const url = `${TRM_API}${path}`;
  const token = getStoredToken();

  console.log(`[TRM] ➡️  ${method} ${url}`);
  if (options?.body) {
    console.log(`[TRM] 📦 Request body:`, JSON.parse(options.body as string));
  }

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  console.log(`[TRM] ⬅️  ${res.status} ${res.statusText} — ${method} ${url}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error(`[TRM] ❌ Error response:`, body);
    throw new Error(body?.message ?? `TRM request failed: ${res.status}`);
  }

  const text = await res.text();
  if (!text) return undefined as T;

  const data = JSON.parse(text) as T;
  console.log(`[TRM] ✅ Response data:`, data);
  return data;
}

// ── Terminales ────────────────────────────────────────────────────────────────

export const terminalesService = {
  list: () => request<TerminalDto[]>('/api/trm/terminales'),
  getById: (id: string) => request<TerminalDto>(`/api/trm/terminales/${id}`),
  create: (payload: Omit<TerminalDto, 'id'>) =>
    request<TerminalDto>('/api/trm/terminales', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<TerminalDto>) =>
    request<TerminalDto>(`/api/trm/terminales/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    request<void>(`/api/trm/terminales/${id}`, { method: 'DELETE' }),
};

// ── Áreas ─────────────────────────────────────────────────────────────────────

export const areasService = {
  list: (terminal_id?: string) =>
    request<AreaDto[]>(`/api/trm/areas${terminal_id ? `?terminal_id=${terminal_id}` : ''}`),
  create: (payload: Omit<AreaDto, 'id'>) =>
    request<AreaDto>('/api/trm/areas', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<AreaDto>) =>
    request<AreaDto>(`/api/trm/areas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    request<void>(`/api/trm/areas/${id}`, { method: 'DELETE' }),
};

// ── Equipos ───────────────────────────────────────────────────────────────────

export const equiposService = {
  list: (terminal_id?: string) =>
    request<EquipoDto[]>(`/api/trm/equipos${terminal_id ? `?terminal_id=${terminal_id}` : ''}`),
  create: (payload: Omit<EquipoDto, 'id'>) =>
    request<EquipoDto>('/api/trm/equipos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<EquipoDto>) =>
    request<EquipoDto>(`/api/trm/equipos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    request<void>(`/api/trm/equipos/${id}`, { method: 'DELETE' }),
};

// ── Riesgos ───────────────────────────────────────────────────────────────────

export const riesgosService = {
  list: (terminal_id?: string) =>
    request<RiesgoDto[]>(`/api/trm/riesgos${terminal_id ? `?terminal_id=${terminal_id}` : ''}`),

  getById: (id: string) => request<RiesgoDto>(`/api/trm/riesgos/${id}`),

  create: (payload: CreateRiesgoPayload) =>
    request<RiesgoDto>('/api/trm/riesgos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateRiesgoPayload) =>
    request<RiesgoDto>(`/api/trm/riesgos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<void>(`/api/trm/riesgos/${id}`, { method: 'DELETE' }),

  historial: (id: string) =>
    request<HistorialEstadoDto[]>(`/api/trm/riesgos/${id}/historial`),

  vincularControl: (riesgo_id: string, payload: { control_id: string; efectivo?: boolean; observaciones?: string }) =>
    request<void>(`/api/trm/riesgos/${riesgo_id}/controles`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  desvincularControl: (riesgo_id: string, control_id: string) =>
    request<void>(`/api/trm/riesgos/${riesgo_id}/controles/${control_id}`, { method: 'DELETE' }),
};

// ── Planes ────────────────────────────────────────────────────────────────────

export const planesService = {
  list: (params?: { riesgo_id?: string; terminal_id?: string; estado?: string }) => {
    const qs = new URLSearchParams();
    if (params?.riesgo_id) qs.set('riesgo_id', params.riesgo_id);
    if (params?.terminal_id) qs.set('terminal_id', params.terminal_id);
    if (params?.estado) qs.set('estado', params.estado);
    const q = qs.toString();
    return request<PlanDto[]>(`/api/trm/planes${q ? `?${q}` : ''}`);
  },

  getById: (id: string) => request<PlanDto>(`/api/trm/planes/${id}`),

  create: (payload: CreatePlanPayload) =>
    request<PlanDto>('/api/trm/planes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdatePlanPayload) =>
    request<PlanDto>(`/api/trm/planes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<void>(`/api/trm/planes/${id}`, { method: 'DELETE' }),

  registrarAvance: (id: string, payload: AvancePlanPayload) =>
    request<PlanDto>(`/api/trm/planes/${id}/avance`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  historial: (id: string) =>
    request<HistorialAvanceDto[]>(`/api/trm/planes/${id}/historial`),
};

// ── Incidentes ────────────────────────────────────────────────────────────────

export const incidentesService = {
  list: (params?: { riesgo_id?: string; terminal_id?: string; estado?: string }) => {
    const qs = new URLSearchParams();
    if (params?.riesgo_id) qs.set('riesgo_id', params.riesgo_id);
    if (params?.terminal_id) qs.set('terminal_id', params.terminal_id);
    if (params?.estado) qs.set('estado', params.estado);
    const q = qs.toString();
    return request<IncidenteDto[]>(`/api/trm/incidentes${q ? `?${q}` : ''}`);
  },

  getById: (id: string) => request<IncidenteDto>(`/api/trm/incidentes/${id}`),

  create: (payload: CreateIncidentePayload) =>
    request<IncidenteDto>('/api/trm/incidentes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateIncidentePayload) =>
    request<IncidenteDto>(`/api/trm/incidentes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<void>(`/api/trm/incidentes/${id}`, { method: 'DELETE' }),

  historial: (id: string) =>
    request<HistorialEstadoDto[]>(`/api/trm/incidentes/${id}/historial`),
};

// ── Tareas de plan ────────────────────────────────────────────────────────────

export const tareasPlanService = {
  list: (plan_id: string) =>
    request<TareaDto[]>(`/api/trm/planes/${plan_id}/tareas`),

  create: (plan_id: string, payload: CreateTareaPayload) =>
    request<TareaDto>(`/api/trm/planes/${plan_id}/tareas`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (plan_id: string, tarea_id: string, payload: UpdateTareaPayload) =>
    request<TareaDto>(`/api/trm/planes/${plan_id}/tareas/${tarea_id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (plan_id: string, tarea_id: string) =>
    request<void>(`/api/trm/planes/${plan_id}/tareas/${tarea_id}`, { method: 'DELETE' }),
};

// ── Controles ─────────────────────────────────────────────────────────────────

export const controlesService = {
  list: () => request<ControlDto[]>('/api/trm/controles'),
  listByRiesgo: (riesgo_id: string) =>
    request<ControlDto[]>(`/api/trm/riesgos/${riesgo_id}/controles`),
  create: (payload: Omit<ControlDto, 'id'>) =>
    request<ControlDto>('/api/trm/controles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<ControlDto>) =>
    request<ControlDto>(`/api/trm/controles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    request<void>(`/api/trm/controles/${id}`, { method: 'DELETE' }),
};

// ── KRI ───────────────────────────────────────────────────────────────────────

export const kriService = {
  list: (terminal_id?: string) =>
    request<KriDto[]>(`/api/trm/kri${terminal_id ? `?terminal_id=${terminal_id}` : ''}`),
  getById: (id: string) => request<KriDto>(`/api/trm/kri/${id}`),
  create: (payload: Omit<KriDto, 'id'>) =>
    request<KriDto>('/api/trm/kri', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<KriDto>) =>
    request<KriDto>(`/api/trm/kri/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    request<void>(`/api/trm/kri/${id}`, { method: 'DELETE' }),
  listValores: (kri_id: string) =>
    request<KriValorDto[]>(`/api/trm/kri/${kri_id}/valores`),
  registrarValor: (kri_id: string, payload: CreateKriValorPayload) =>
    request<KriValorDto>(`/api/trm/kri/${kri_id}/valores`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// ── Escalamientos ─────────────────────────────────────────────────────────────

export const escalamientosService = {
  list: (params?: { terminal_id?: string; estado?: string }) => {
    const qs = new URLSearchParams();
    if (params?.terminal_id) qs.set('terminal_id', params.terminal_id);
    if (params?.estado) qs.set('estado', params.estado);
    const q = qs.toString();
    return request<EscalamientoDto[]>(`/api/trm/escalamientos${q ? `?${q}` : ''}`);
  },

  getById: (id: string) => request<EscalamientoDto>(`/api/trm/escalamientos/${id}`),

  create: (payload: CreateEscalamientoPayload) =>
    request<EscalamientoDto>('/api/trm/escalamientos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<CreateEscalamientoPayload>) =>
    request<EscalamientoDto>(`/api/trm/escalamientos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  responder: (id: string, payload: ResponderEscalamientoPayload) =>
    request<EscalamientoDto>(`/api/trm/escalamientos/${id}/responder`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  historial: (id: string) =>
    request<HistorialEstadoDto[]>(`/api/trm/escalamientos/${id}/historial`),

  delete: (id: string) =>
    request<void>(`/api/trm/escalamientos/${id}`, { method: 'DELETE' }),
};

// ── Acciones Correctivas ─────────────────────────────────────────────────────────

export const accionesService = {
  list: (terminal_id?: string) =>
    request<AccionDto[]>(`/api/trm/acciones${terminal_id ? `?terminal_id=${terminal_id}` : ''}`),
  create: (payload: CreateAccionPayload) =>
    request<AccionDto>('/api/trm/acciones', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: UpdateAccionPayload) =>
    request<AccionDto>(`/api/trm/acciones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    request<void>(`/api/trm/acciones/${id}`, { method: 'DELETE' }),
};

// ── Comentarios ─────────────────────────────────────────────────────────────────

export const comentariosService = {
  list: (params: { entidad_tipo: string; entidad_id: string }) =>
    request<ComentarioDto[]>(`/api/trm/comentarios?entidad_tipo=${params.entidad_tipo}&entidad_id=${params.entidad_id}`),
  create: (payload: CreateComentarioPayload) =>
    request<ComentarioDto>('/api/trm/comentarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    request<void>(`/api/trm/comentarios/${id}`, { method: 'DELETE' }),
};

// ── Notificaciones ───────────────────────────────────────────────────────────────

export const notificacionesService = {
  list: (usuario_id: string, soloNoLeidas?: boolean) => {
    const qs = new URLSearchParams();
    qs.set('usuario_id', usuario_id);
    if (soloNoLeidas) qs.set('solo_no_leidas', 'true');
    return request<NotificacionDto[]>(`/api/trm/notificaciones?${qs.toString()}`);
  },
};
