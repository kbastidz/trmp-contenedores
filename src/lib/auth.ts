// En static export no hay servidor Next.js, así que siempre llamamos directo al backend.
const BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:3000';

const SESSION_TOKEN_KEY = 'trm_session_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  }
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: string;
  token?: string; // Better Auth también puede devolver el token directamente
}

export interface SignInResponse {
  redirect: boolean;
  token: string;
  user: AuthUser;
  session?: AuthSession;
}

export interface SignUpResponse {
  redirect: boolean;
  token: string;
  user: AuthUser;
  session?: AuthSession;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }

  // 204 No Content o respuesta vacía
  const text = await res.text();
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

/**
 * Hace sign-in y extrae el token de sesión.
 * Better Auth devuelve el token directamente en el body: { token, user, redirect }
 */
async function signInAndStoreToken(
  path: string,
  body: Record<string, string>
): Promise<SignInResponse> {
  const existingToken = getStoredToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(existingToken ? { Authorization: `Bearer ${existingToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.message ?? `Request failed: ${res.status}`);
  }

  const result: SignInResponse = await res.json();

  // El token viene en result.token (campo directo del body de Better Auth)
  if (result?.token) {
    setStoredToken(result.token);
    console.log('[Auth] Token de sesión almacenado correctamente');
  } else {
    console.warn('[Auth] No se encontró token en la respuesta del sign-in');
  }

  return result;
}

export const authService = {
  signIn: (email: string, password: string) =>
    signInAndStoreToken('/api/auth/sign-in/email', { email, password }),

  signUp: (name: string, email: string, password: string) =>
    signInAndStoreToken('/api/auth/sign-up/email', { name, email, password }),

  signOut: async () => {
    await request<void>('/api/auth/sign-out', { method: 'POST' });
    setStoredToken(null);
  },

  getSession: () =>
    request<{ user: AuthUser; session: AuthSession } | null>('/api/auth/get-session'),
};

// ── Users CRUD ────────────────────────────────────────────────────────────────

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  roles?: { id: string; name: string }[];
}

export const usersService = {
  list: () =>
    request<UserListItem[]>('/api/users'),

  getById: (id: string) =>
    request<UserListItem>(`/api/users/${id}`),

  update: (id: string, payload: { name?: string; image?: string }) =>
    request<UserListItem>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<void>(`/api/users/${id}`, { method: 'DELETE' }),

  assignRole: (userId: string, roleIds: string[]) =>
    request<void>(`/api/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ roleIds }),
    }),

  removeRole: (userId: string, roleId: string) =>
    request<void>(`/api/users/${userId}/roles/${roleId}`, { method: 'DELETE' }),
};

// ── Roles ─────────────────────────────────────────────────────────────────────

export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
}

export const rolesService = {
  list: () => request<RoleDto[]>('/api/roles'),
};
