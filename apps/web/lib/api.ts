import { clearTokens, getAccessToken } from "./auth";
import type {
  AnalyticsSummary,
  BreakdownDimension,
  BreakdownItem,
  CreateLinkInput,
  Link,
  LoginResponse,
  TimeGranularity,
  TimeSeriesPoint,
  User,
} from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiOptions = RequestInit & { skipAuth?: boolean };

async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  const token = skipAuth ? null : getAccessToken();

  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  if (res.status === 304) {
    throw new ApiError("Cached response unavailable — please refresh", 304);
  }

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401 && !skipAuth) {
      clearTokens();
    }
    throw new ApiError(
      data.message ?? data.error ?? "Request failed",
      res.status,
    );
  }

  return data as T;
}

export const authApi = {
  register: (email: string, password: string) =>
    api<{ id: string; email: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),

  login: (email: string, password: string) =>
    api<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),

  me: () => api<User | null>("/api/auth/me"),
};

export const linksApi = {
  list: () => api<Link[]>("/api/links"),

  get: (id: string) => api<Link>(`/api/links/${id}`),

  create: (input: CreateLinkInput) =>
    api<Link>("/api/links", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  delete: (id: string) =>
    api<void>(`/api/links/${id}`, { method: "DELETE" }),
};

export const analyticsApi = {
  summary: (id: string) => api<AnalyticsSummary>(`/api/analytics/${id}`),

  timeseries: (
    id: string,
    granularity: TimeGranularity = "day",
    last?: number,
  ) => {
    const params = new URLSearchParams({ granularity });
    if (last !== undefined) params.set("last", String(last));
    return api<TimeSeriesPoint[]>(
      `/api/analytics/${id}/timeseries?${params}`,
    );
  },

  breakdown: (id: string, by: BreakdownDimension) =>
    api<BreakdownItem[]>(`/api/analytics/${id}/breakdown?by=${by}`),
};
