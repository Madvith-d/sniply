export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Link {
  id: string;
  shortCode: string;
  originalUrl: string;
  userId: string;
  startsAt: string | null;
  expiresAt: string | null;
  clickCap: number | null;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  total: number;
  unique: number;
  bots: number;
  humans: number;
}

export interface BreakdownItem {
  label: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesPoint {
  period: string;
  clicks: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export type BreakdownDimension =
  | "device"
  | "browser"
  | "os"
  | "country"
  | "city";

export type TimeGranularity = "hour" | "day" | "week";

export interface CreateLinkInput {
  originalUrl: string;
  alias?: string;
  startsAt?: string;
  expiresAt?: string;
  clickCap?: number;
}
