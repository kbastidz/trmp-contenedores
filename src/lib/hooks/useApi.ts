import { useEffect, useState, useCallback } from 'react';
import { useFetch } from '@mantine/hooks';
import type { IApiResponse } from '@/types/api-response';
import type { CustomerDto } from '@/types';
import { riesgosService, planesService, incidentesService, controlesService, kriService, escalamientosService } from '@/lib/trm';
import type { RiesgoDto, HistorialEstadoDto, PlanDto, HistorialAvanceDto, IncidenteDto, ControlDto, KriDto, EscalamientoDto } from '@/types/trm';
import { authService, setStoredToken } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';
import { assetUrl } from '@/lib/basePath';

export type ApiResponse<T> = IApiResponse<T>;

// ── Session ───────────────────────────────────────────────────────────────────

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession()
      .then(session => setUser(session?.user ?? null))
      .catch(() => {
        // Sesión inválida o expirada — limpiar token almacenado
        setStoredToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

// Generic hook for GET requests
export function useApiGet<T>(endpoint: string) {
  return useFetch<ApiResponse<T>>(endpoint);
}

// Hook for customers — lee el JSON mock directamente (sin API route, compatible con static export)
export function useCustomers() {
  return useApiGet<CustomerDto[]>(assetUrl('/mocks/Customers.json'));
}

// Hook for admin users (calls external auth service directly)
export function useAdminUsers() {
  const [data, setData] = useState<import('@/lib/auth').UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await import('@/lib/auth').then(m => m.usersService.list());
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return { data, loading, error, refetch: fetchUsers };
}

export function useAreas(terminal_id?: string) {
  const [data, setData] = useState<import('@/types/trm').AreaDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/trm').then(m => m.areasService.list(terminal_id))
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [terminal_id]);

  return { data, loading };
}



export function useRiesgos(terminal_id?: string) {
  const [data, setData] = useState<RiesgoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRiesgos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await riesgosService.list(terminal_id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar riesgos'));
    } finally {
      setLoading(false);
    }
  }, [terminal_id]);

  useEffect(() => { fetchRiesgos(); }, [fetchRiesgos]);

  return { data, loading, error, refetch: fetchRiesgos };
}

export function useRiesgo(id: string | null) {
  const [data, setData] = useState<RiesgoDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch_ = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await riesgosService.getById(id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar riesgo'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { data, loading, error, refetch: fetch_ };
}

export function useRiesgoHistorial(id: string | null) {
  const [data, setData] = useState<HistorialEstadoDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    riesgosService.historial(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  return { data, loading };
}

export function usePlanesByRiesgo(riesgo_id: string | null) {
  const [data, setData] = useState<PlanDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!riesgo_id) return;
    setLoading(true);
    planesService.list({ riesgo_id }).then(setData).finally(() => setLoading(false));
  }, [riesgo_id]);

  return { data, loading };
}

export function useIncidentesByRiesgo(riesgo_id: string | null) {
  const [data, setData] = useState<IncidenteDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!riesgo_id) return;
    setLoading(true);
    incidentesService.list({ riesgo_id }).then(setData).finally(() => setLoading(false));
  }, [riesgo_id]);

  return { data, loading };
}

export function useControlesByRiesgo(riesgo_id: string | null) {
  const [data, setData] = useState<ControlDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!riesgo_id) return;
    setLoading(true);
    controlesService.listByRiesgo(riesgo_id).then(setData).finally(() => setLoading(false));
  }, [riesgo_id]);

  return { data, loading };
}

export function useKriByTerminal(terminal_id: string | null) {
  const [data, setData] = useState<KriDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!terminal_id) return;
    setLoading(true);
    kriService.list(terminal_id).then(setData).finally(() => setLoading(false));
  }, [terminal_id]);

  return { data, loading };
}

export function useIncidentes(params?: { terminal_id?: string; estado?: string }) {
  const [data, setData] = useState<IncidenteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await incidentesService.list(params));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar incidentes'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.terminal_id, params?.estado]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { data, loading, error, refetch: fetch_ };
}

export function useIncidente(id: string | null) {
  const [data, setData] = useState<IncidenteDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch_ = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await incidentesService.getById(id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar incidente'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { data, loading, error, refetch: fetch_ };
}

export function useIncidenteHistorial(id: string | null) {
  const [data, setData] = useState<HistorialEstadoDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    incidentesService.historial(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  return { data, loading };
}

export function usePlanes(params?: { terminal_id?: string; estado?: string }) {
  const [data, setData] = useState<PlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await planesService.list(params));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar planes'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.terminal_id, params?.estado]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { data, loading, error, refetch: fetch_ };
}

export function usePlan(id: string | null) {
  const [data, setData] = useState<PlanDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch_ = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await planesService.getById(id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar plan'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { data, loading, error, refetch: fetch_ };
}

export function usePlanHistorial(id: string | null) {
  const [data, setData] = useState<HistorialAvanceDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    planesService.historial(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  return { data, loading };
}

export function useEscalamientos(params?: { terminal_id?: string; estado?: string }) {
  const [data, setData] = useState<EscalamientoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await escalamientosService.list(params));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar escalamientos'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.terminal_id, params?.estado]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { data, loading, error, refetch: fetch_ };
}

export function useEscalamiento(id: string | null) {
  const [data, setData] = useState<EscalamientoDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch_ = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await escalamientosService.getById(id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar escalamiento'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { data, loading, error, refetch: fetch_ };
}

export function useEscalamientoHistorial(id: string | null) {
  const [data, setData] = useState<HistorialEstadoDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    escalamientosService.historial(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  return { data, loading };
}
