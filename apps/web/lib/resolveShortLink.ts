import { headers } from "next/headers";
import { API_BASE } from "./api";

export type ShortLinkState =
  | "scheduled"
  | "expired"
  | "capped"
  | "not_found"
  | "error";

export type ShortLinkResolution =
  | { status: "redirect"; url: string }
  | { status: ShortLinkState };

function getForwardHeaders(
  headerList: Awaited<ReturnType<typeof headers>>,
): Record<string, string> {
  const forward: Record<string, string> = {};

  const userAgent = headerList.get("user-agent");
  if (userAgent) forward["User-Agent"] = userAgent;

  const referer = headerList.get("referer");
  if (referer) forward.Referer = referer;

  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    forward["X-Forwarded-For"] = forwardedFor;
  } else {
    const realIp = headerList.get("x-real-ip");
    if (realIp) forward["X-Forwarded-For"] = realIp;
  }

  return forward;
}

export async function resolveShortLink(
  shortCode: string,
): Promise<ShortLinkResolution> {
  try {
    const headerList = await headers();
    const res = await fetch(`${API_BASE}/${encodeURIComponent(shortCode)}`, {
      redirect: "manual",
      cache: "no-store",
      headers: getForwardHeaders(headerList),
    });

    if (
      res.status === 307 ||
      res.status === 302 ||
      res.status === 301
    ) {
      const url = res.headers.get("Location");
      if (url) return { status: "redirect", url };
      return { status: "error" };
    }

    if (res.status === 404) {
      return { status: "not_found" };
    }

    if (res.status === 200) {
      return { status: "scheduled" };
    }

    if (res.status === 410) {
      return { status: "expired" };
    }

    if (res.status === 429) {
      return { status: "capped" };
    }

    return { status: "error" };
  } catch {
    return { status: "error" };
  }
}
