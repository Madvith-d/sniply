import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { ShortLinkState } from "@/lib/resolveShortLink";

interface LinkInterstitialPageProps {
  state: ShortLinkState;
  shortCode: string;
}

const stateConfig: Record<
  ShortLinkState,
  {
    title: string;
    description: string;
    badge: string;
    accent: string;
  }
> = {
  scheduled: {
    title: "Link not active yet",
    description:
      "This short link is scheduled and isn't open for clicks yet. Check back once it goes live.",
    badge: "Scheduled",
    accent: "bg-yellow",
  },
  expired: {
    title: "Link expired",
    description:
      "This short link has passed its expiry date and is no longer available.",
    badge: "Expired",
    accent: "bg-red",
  },
  capped: {
    title: "Click limit reached",
    description:
      "This short link has reached its maximum number of clicks and can't accept more visits.",
    badge: "Capped",
    accent: "bg-red",
  },
  not_found: {
    title: "Link not found",
    description:
      "We couldn't find a short link with that code. It may have been deleted or mistyped.",
    badge: "Not found",
    accent: "bg-purple",
  },
  error: {
    title: "Something went wrong",
    description:
      "We couldn't resolve this short link right now. Please try again in a moment.",
    badge: "Error",
    accent: "bg-purple",
  },
};

export function LinkInterstitialPage({
  state,
  shortCode,
}: LinkInterstitialPageProps) {
  const config = stateConfig[state];

  return (
    <div className="max-w-lg mx-auto px-4 py-16 md:py-24">
      <div className="brutal-card p-6 md:p-8 flex flex-col gap-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <span
            className={`inline-flex px-3 py-1 text-xs font-bold font-heading border-[2px] border-ink rounded-md ${config.accent}`}
          >
            {config.badge}
          </span>
          <span className="font-mono text-sm text-ink/50 truncate max-w-[50%]">
            /{shortCode}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl md:text-3xl font-bold font-heading leading-tight">
            {config.title}
          </h1>
          <p className="text-ink/70 leading-relaxed">{config.description}</p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button variant="secondary">Back to Sniply</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
