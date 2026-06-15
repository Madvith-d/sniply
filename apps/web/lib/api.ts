import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./auth";
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

export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

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


async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // Server returned non-JSON (HTML error page, gateway error, …)
    console.error(
      `[api] Non-JSON response (HTTP ${res.status}) from ${res.url}:`,
      text.slice(0, 300),
    );
    throw new ApiError(
      `Server returned an unexpected response (HTTP ${res.status}). ` +
      `This is due to render cold start please try again in a moment`,
      res.status || 500,
    );
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = (await safeJson(res)) as { accessToken: string };
    setTokens(data.accessToken, refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  const token = skipAuth ? null : getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
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

  // On 401, attempt a silent token refresh and retry once
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      const retryRes = await fetch(`${API_URL}${path}`, {
        cache: "no-store",
        ...fetchOptions,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
          ...fetchOptions.headers,
        },
      });

      if (retryRes.status === 204) return undefined as T;

      const retryData = await safeJson(retryRes); // ← was retryRes.json()

      if (!retryRes.ok) {
        if (retryRes.status === 401) clearTokens();
        throw new ApiError(
          (retryData as { message?: string; error?: string }).message ??
          (retryData as { message?: string; error?: string }).error ??
          "Request failed",
          retryRes.status,
        );
      }

      return retryData as T;
    }

    // Refresh failed — clear tokens and surface the error
    clearTokens();
    const data = await safeJson(res).catch(() => ({}));
    throw new ApiError(
      (data as { message?: string; error?: string }).message ??
      (data as { message?: string; error?: string }).error ??
      "Request failed",
      401,
    );
  }

  const data = await safeJson(res); // ← was res.json()

  if (!res.ok) {
    throw new ApiError(
      (data as { message?: string; error?: string }).message ??
      (data as { message?: string; error?: string }).error ??
      "Request failed",
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

  delete: (id: string) => api<void>(`/api/links/${id}`, { method: "DELETE" }),
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
    return api<TimeSeriesPoint[]>(`/api/analytics/${id}/timeseries?${params}`);
  },

  breakdown: (id: string, by: BreakdownDimension) =>
    api<BreakdownItem[]>(`/api/analytics/${id}/breakdown?by=${by}`),
};