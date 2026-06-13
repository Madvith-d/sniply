import geoip from "geoip-lite";

// RFC 1918 / loopback / link-local ranges that have no meaningful geo data
const PRIVATE_IP_RE = [
    /^127\./,           // loopback IPv4
    /^10\./,            // RFC 1918
    /^192\.168\./,      // RFC 1918
    /^172\.(1[6-9]|2\d|3[01])\./, // RFC 1918
    /^::1$/,            // loopback IPv6
    /^fc00:/i,          // unique-local IPv6
    /^fe80:/i,          // link-local IPv6
    /^unknown$/i,       // sentinel used when IP is unavailable
];

function isPrivateIP(ip: string): boolean {
    return PRIVATE_IP_RE.some((re) => re.test(ip));
}

export interface GeoInfo {
    country?: string | null;
    city?: string | null;
}

/**
 * Returns approximate country + city for a given IP address.
 *
 * Strategy:
 *  1. Skip immediately for private / loopback IPs.
 *  2. Try geoip-lite (synchronous local DB lookup — zero latency).
 *  3. Fall back to ip-api.com (free, no API key, city-level accuracy)
 *     with a 1.5 s timeout so redirects never hang.
 */
export async function lookupGeo(ip: string): Promise<GeoInfo> {
    if (!ip || isPrivateIP(ip)) return {};

    // Fast path — local MaxMind DB bundled with geoip-lite
    const local = geoip.lookup(ip);
    if (local) {
        return { country: local.country, city: local.city };
    }

    // Fallback — ip-api.com (free, non-commercial, ≤45 req/min)
    // Returns city-level approximate location, not street-level.
    try {
        const controller = new AbortController();
        const timer = setTimeout(
            () => controller.abort(),
            1500
        );

        const res = await fetch(
            `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,city`,
            { signal: controller.signal }
        );

        clearTimeout(timer);

        if (res.ok) {
            const data = (await res.json()) as {
                status: string;
                countryCode?: string;
                city?: string;
            };

            if (data.status === "success") {
                return {
                    country: data.countryCode ?? null,
                    city: data.city ?? null,
                };
            }
        }
    } catch {
        // Network error or timeout — geo simply stays null
    }

    return {};
}
