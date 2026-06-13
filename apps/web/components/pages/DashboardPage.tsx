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
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load links");
        }
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
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">
          Your links
        </h1>
        <p className="text-ink/70 mt-1">
          Create, manage, and track your short URLs.
        </p>
      </div>

      <CreateLinkForm onCreated={handleCreated} />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold font-heading">
          {links.length} link{links.length !== 1 ? "s" : ""}
        </h2>

        {loading && (
          <div className="brutal-card-sm p-6 text-center font-heading font-bold animate-pulse">
            Loading links...
          </div>
        )}

        {error && (
          <p className="text-sm font-medium text-red bg-red/20 border-[2px] border-red rounded-[10px] px-3 py-2">
            {error}
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
