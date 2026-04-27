import { useEffect, useState, useCallback } from 'react';
import { useFetch } from '@mantine/hooks';
import type { IApiResponse } from '@/types/api-response';
import type { CustomerDto } from '@/types';
import { riesgosService } from '@/lib/trm';
import type { RiesgoDto } from '@/types/trm';

export type ApiResponse<T> = IApiResponse<T>;

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:3000';

// Generic hook for GET requests
export function useApiGet<T>(endpoint: string) {
  return useFetch<ApiResponse<T>>(endpoint);
}

// Hook for customers
export function useCustomers() {
  return useApiGet<CustomerDto[]>('/api/customers');
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

// ── Riesgos TRM ───────────────────────────────────────────────────────────────

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
