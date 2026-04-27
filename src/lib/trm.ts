import type {
  RiesgoDto,
  CreateRiesgoPayload,
  UpdateRiesgoPayload,
  HistorialEstadoDto,
  TerminalDto,
  AreaDto,
} from '@/types/trm';

const TRM_API =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_TRM_API_URL ?? 'http://localhost:3001')
    : (process.env.NEXT_PUBLIC_TRM_API_URL ?? 'http://localhost:3001');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${TRM_API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `TRM request failed: ${res.status}`);
  }

  const text = await res.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
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
