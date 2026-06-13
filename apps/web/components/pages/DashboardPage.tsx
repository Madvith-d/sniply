"use client";

import { useEffect, useState } from "react";
import { linksApi } from "@/lib/api";
import type { Link } from "@/lib/types";
import { CreateLinkForm } from "@/components/links/CreateLinkForm";
import { LinkCard } from "@/components/links/LinkCard";
import { EmptyState } from "@/components/ui/MetricCard";

export function DashboardPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const data = await linksApi.list();
        if (!cancelled) setLinks(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load links");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleCreated(link: Link) {
    setLinks((prev) => [link, ...prev]);
  }

  function handleDelete(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
          Your links
        </h1>
        <p className="text-ink/60 text-sm sm:text-base">
          Create, manage, and track your short URLs.
        </p>
      </div>

      <CreateLinkForm onCreated={handleCreated} />

      {/* Links list */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold font-heading uppercase tracking-widest text-ink/50">
            {links.length} link{links.length !== 1 ? "s" : ""}
          </h2>
        </div>

        {loading && (
          <div className="brutal-card-sm bg-card p-6 text-center font-heading font-bold animate-pulse text-ink/60">
            Loading links…
          </div>
        )}

        {error && (
          <p className="text-sm font-semibold text-red bg-red/10 border-[2px] border-red rounded-[8px] px-4 py-3 flex items-center gap-2">
            <span>⚠</span> {error}
          </p>
        )}

        {!loading && !error && links.length === 0 && (
          <EmptyState
            title="No links yet"
            description="Create your first short link above to get started."
          />
        )}

        {!loading && links.length > 0 && (
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
