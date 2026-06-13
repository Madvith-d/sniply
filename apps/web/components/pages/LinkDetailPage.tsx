"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { linksApi } from "@/lib/api";
import type { Link as LinkType } from "@/lib/types";
import { formatDate, getLinkStatus, shortUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/links/CopyButton";

interface LinkDetailPageProps {
  id: string;
}

const statusConfig = {
  active: { label: "Active", variant: "success" as const },
  scheduled: { label: "Scheduled", variant: "warning" as const },
  expired: { label: "Expired", variant: "error" as const },
  capped: { label: "Capped", variant: "error" as const },
};

export function LinkDetailPage({ id }: LinkDetailPageProps) {
  const router = useRouter();
  const [link, setLink] = useState<LinkType | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    linksApi
      .get(id)
      .then(setLink)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Link not found"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this link? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await linksApi.delete(id);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="brutal-card-sm p-6 text-center font-heading font-bold animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card title="Link not found">
          <p className="text-ink/70 mb-4">{error || "This link does not exist."}</p>
          <Link href="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const status = getLinkStatus(link);
  const config = statusConfig[status];
  const url = shortUrl(link.shortCode);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10 flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="text-sm font-bold font-heading hover:underline w-fit"
      >
        ← Back to dashboard
      </Link>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold font-heading">
          Link details
        </h1>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      <Card>
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold font-heading uppercase tracking-wide text-ink/50">
              Short URL
            </label>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-mono text-lg font-bold text-blue hover:underline mt-1 break-all"
            >
              {url}
            </a>
          </div>

          <div>
            <label className="text-xs font-bold font-heading uppercase tracking-wide text-ink/50">
              Destination
            </label>
            <p className="font-mono text-sm mt-1 break-all">{link.originalUrl}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Short code" value={link.shortCode} mono />
            <DetailField
              label="Total clicks"
              value={link.clickCount.toLocaleString()}
              mono
            />
            <DetailField label="Created" value={formatDate(link.createdAt)} />
            <DetailField label="Updated" value={formatDate(link.updatedAt)} />
            {link.startsAt && (
              <DetailField
                label="Starts at"
                value={formatDate(link.startsAt)}
              />
            )}
            {link.expiresAt && (
              <DetailField
                label="Expires at"
                value={formatDate(link.expiresAt)}
              />
            )}
            {link.clickCap !== null && (
              <DetailField
                label="Click cap"
                value={link.clickCap.toLocaleString()}
                mono
              />
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <CopyButton text={url} />
        <Link href={`/analytics/${link.id}`}>
          <Button>View analytics</Button>
        </Link>
        <Button variant="danger" loading={deleting} onClick={handleDelete}>
          Delete link
        </Button>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-bold font-heading uppercase tracking-wide text-ink/50">
        {label}
      </label>
      <p className={`text-sm mt-1 ${mono ? "font-mono font-bold" : ""}`}>
        {value}
      </p>
    </div>
  );
}
