"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { BRAND_NAME } from "@/lib/utils";

export function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutal-card-sm bg-card px-6 py-4 font-heading font-bold animate-pulse">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-28">
      {/* Hero */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="flex flex-col gap-6 order-2 lg:order-1">
          <div className="inline-flex w-fit px-3 py-1.5 text-[11px] font-extrabold font-heading uppercase tracking-widest border-[2.5px] border-ink rounded-md bg-blue text-ink">
            URL shortener for builders
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading leading-[1.05] tracking-tight">
            Short links.
            <br />
            Real analytics.
            <br />
            <span className="relative inline-block">
              No fluff.
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-orange" />
            </span>
          </h1>

          <p className="text-base sm:text-lg text-ink/65 max-w-md leading-relaxed font-sans">
            {BRAND_NAME} turns long URLs into short codes with click tracking, geo
            breakdowns, and scheduling — built for developers who want tools
            that actually work.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/register">
              <Button className="text-sm sm:text-base px-5 sm:px-6 py-2.5">
                Get started free →
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="secondary"
                className="text-sm sm:text-base px-5 sm:px-6 py-2.5"
              >
                Log in
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo card */}
        <div className="order-1 lg:order-2 brutal-card-lg bg-card p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-2 text-sm font-mono text-ink/50 bg-paper-2 rounded-[6px] border-[2px] border-ink px-3 py-2">
            <span className="shrink-0 text-[10px] font-bold font-heading uppercase tracking-wider border-[2px] border-ink/40 rounded px-1.5 py-0.5 bg-card">
              orig
            </span>
            <span className="truncate">
              https://docs.example.com/guides/getting-started
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-[2.5px] bg-ink/20" />
            <span className="text-[10px] font-bold font-heading uppercase tracking-widest text-ink/40">
              shortened
            </span>
            <div className="flex-1 h-[2.5px] bg-ink/20" />
          </div>

          <div className="flex items-center gap-3 bg-yellow/20 border-[2.5px] border-ink rounded-[8px] px-4 py-3 shadow-[4px_4px_0_var(--shadow-color)]">
            <span className="shrink-0 text-[10px] font-bold font-heading uppercase tracking-wider border-[2px] border-ink/40 rounded px-1.5 py-0.5 bg-card">
              url
            </span>
            <span className="font-mono font-bold text-blue text-base sm:text-lg truncate">
              {BRAND_NAME.toLowerCase().replace(/[^a-z0-9]/g, "")}.ly/docs
            </span>
            <svg
              className="ml-auto shrink-0 text-ink/40"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="brutal-card-sm bg-card p-3 text-center">
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-blue tabular-nums">
                847
              </div>
              <div className="text-[10px] font-extrabold font-heading uppercase tracking-wider mt-1 text-ink/60">
                Clicks
              </div>
            </div>
            <div className="brutal-card-sm bg-purple p-3 text-center">
              <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums">
                612
              </div>
              <div className="text-[10px] font-extrabold font-heading uppercase tracking-wider mt-1 text-ink/60">
                Unique
              </div>
            </div>
            <div className="brutal-card-sm bg-green p-3 text-center">
              <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums">
                94%
              </div>
              <div className="text-[10px] font-extrabold font-heading uppercase tracking-wider mt-1 text-ink/60">
                Human
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-20 sm:mt-28">
        <p className="text-[11px] font-extrabold font-heading uppercase tracking-widest text-ink/40 mb-6 text-center">
          Everything you need
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              emoji: "🔗",
              title: "Custom aliases",
              desc: "Pick your own short code or let us generate one automatically.",
            },
            {
              emoji: "⏱",
              title: "Smart scheduling",
              desc: "Set start dates, expiry windows, and click caps per link.",
            },
            {
              emoji: "📊",
              title: "Deep analytics",
              desc: "Device, browser, OS, country, and city breakdowns in real time.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="brutal-card-sm bg-card p-5 sm:p-6 flex flex-col gap-3 hover:-translate-y-px hover:shadow-[4px_5px_0_var(--shadow-color)] transition-all duration-150"
            >
              <span className="text-2xl">{feature.emoji}</span>
              <h3 className="font-extrabold font-heading tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-ink/65 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
