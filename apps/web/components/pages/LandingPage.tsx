"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

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
        <div className="brutal-card-sm px-6 py-4 font-heading font-bold animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit px-3 py-1 text-xs font-bold font-heading border-[2px] border-ink rounded-md bg-yellow">
            URL shortener for builders
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-[1.1] tracking-tight">
            Short links.
            <br />
            Real analytics.
            <br />
            No fluff.
          </h1>
          <p className="text-lg text-ink/70 max-w-md leading-relaxed">
            Sniply turns long URLs into short codes with click tracking,
            geo breakdowns, and scheduling — built for developers who want
            tools that actually work.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button>Get started free</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Log in</Button>
            </Link>
          </div>
        </div>

        <div className="brutal-card p-6 md:p-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-mono">
            <span className="text-ink/50">original</span>
            <span className="truncate">
              https://docs.example.com/guides/getting-started
            </span>
          </div>
          <div className="h-[3px] bg-ink" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-ink/50">short</span>
            <span className="font-mono font-bold text-blue text-lg">
              localhost:4000/docs
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="brutal-card-sm p-3 text-center">
              <div className="text-xl font-mono font-bold text-blue">847</div>
              <div className="text-[10px] font-heading font-bold uppercase mt-1">
                Clicks
              </div>
            </div>
            <div className="brutal-card-sm p-3 text-center bg-purple">
              <div className="text-xl font-mono font-bold">612</div>
              <div className="text-[10px] font-heading font-bold uppercase mt-1">
                Unique
              </div>
            </div>
            <div className="brutal-card-sm p-3 text-center bg-green">
              <div className="text-xl font-mono font-bold">94%</div>
              <div className="text-[10px] font-heading font-bold uppercase mt-1">
                Human
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-16 md:mt-24">
        {[
          {
            title: "Custom aliases",
            desc: "Pick your own short code or let us generate one.",
          },
          {
            title: "Smart scheduling",
            desc: "Set start dates, expiry, and click caps per link.",
          },
          {
            title: "Deep analytics",
            desc: "Device, browser, OS, country, and city breakdowns.",
          },
        ].map((feature) => (
          <div key={feature.title} className="brutal-card-sm p-5">
            <h3 className="font-heading font-bold mb-2">{feature.title}</h3>
            <p className="text-sm text-ink/70">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
