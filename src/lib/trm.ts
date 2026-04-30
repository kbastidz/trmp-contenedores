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
  IncidenteDto,
  CreateIncidentePayload,
  UpdateIncidentePayload,
  ControlDto,
  KriDto,
  EscalamientoDto,
  CreateEscalamientoPayload,
  ResponderEscalamientoPayload,
} from '@/types/trm';

const TRM_API =
  typeof window !== 'undefined'
    ? ''  // en el browser llama al proxy local /api/trm/...
    : (process.env.NEXT_PUBLIC_TRM_API_URL ?? 'http://localhost:3002'); // en SSR va directo

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method ?? 'GET';
  const url = `${TRM_API}${path}`;

  console.log(`[TRM] ➡️  ${method} ${url}`);
  if (options?.body) {
    console.log(`[TRM] 📦 Request body:`, JSON.parse(options.body as string));
  }

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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
};

// ── Áreas ─────────────────────────────────────────────────────────────────────

export const areasService = {
  list: (terminal_id?: string) =>
    request<AreaDto[]>(`/api/trm/areas${terminal_id ? `?terminal_id=${terminal_id}` : ''}`),
};

// ── Equipos ───────────────────────────────────────────────────────────────────

export const equiposService = {
  list: (terminal_id?: string) =>
    request<EquipoDto[]>(`/api/trm/equipos${terminal_id ? `?terminal_id=${terminal_id}` : ''}`),
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

// ── Controles ─────────────────────────────────────────────────────────────────

export const controlesService = {
  listByRiesgo: (riesgo_id: string) =>
    request<ControlDto[]>(`/api/trm/riesgos/${riesgo_id}/controles`),
};

// ── KRI ───────────────────────────────────────────────────────────────────────

export const kriService = {
  list: (terminal_id?: string) =>
    request<KriDto[]>(`/api/trm/kri${terminal_id ? `?terminal_id=${terminal_id}` : ''}`),
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
};
