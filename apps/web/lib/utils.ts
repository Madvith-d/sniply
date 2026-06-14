import type { Link } from "./types";

export const APP_BASE =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const BRAND_NAME =
  process.env.NEXT_PUBLIC_BRAND_NAME || "Sniply";

export function shortUrl(shortCode: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/${shortCode}`;
  }
  return `${APP_BASE}/${shortCode}`;
}

export type LinkStatus = "active" | "scheduled" | "expired" | "capped";

export function getLinkStatus(link: Link): LinkStatus {
  const now = Date.now();

  if (link.expiresAt && new Date(link.expiresAt).getTime() < now) {
    return "expired";
  }
  if (link.startsAt && new Date(link.startsAt).getTime() > now) {
    return "scheduled";
  }
  if (link.clickCap !== null && link.clickCount >= link.clickCap) {
    return "capped";
  }
  return "active";
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatPeriod(period: string): string {
  if (period.includes(":")) {
    const [date, time] = period.split(" ");
    return `${date} ${time}`;
  }
  return period;
}

export function truncateUrl(url: string, max = 48): string {
  if (url.length <= max) return url;
  return url.slice(0, max - 3) + "...";
}

export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string | undefined {
  if (!value) return undefined;
  return new Date(value).toISOString();
}
