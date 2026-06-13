"use client";

import { useState } from "react";
import Link from "next/link";
import { linksApi } from "@/lib/api";
import type { Link as LinkType } from "@/lib/types";
import {
  formatDate,
  getLinkStatus,
  shortUrl,
  truncateUrl,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/links/CopyButton";

interface LinkCardProps {
  link: LinkType;
  onDelete: (id: string) => void;
}

const statusConfig = {
  active: { label: "Active", variant: "success" as const },
  scheduled: { label: "Scheduled", variant: "warning" as const },
  expired: { label: "Expired", variant: "error" as const },
  capped: { label: "Capped", variant: "error" as const },
};

export function LinkCard({ link, onDelete }: LinkCardProps) {
  const [deleting, setDeleting] = useState(false);
  const status = getLinkStatus(link);
  const config = statusConfig[status];
  const url = shortUrl(link.shortCode);

  async function handleDelete() {
    if (!confirm("Delete this link? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await linksApi.delete(link.id);
      onDelete(link.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="brutal-card-sm p-4 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm font-bold text-blue hover:underline break-all"
          >
            {url}
          </a>
          <p
            className="text-sm text-ink/60 mt-1 truncate"
            title={link.originalUrl}
          >
            → {truncateUrl(link.originalUrl)}
          </p>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-ink/70">
        <span>{link.clickCount.toLocaleString()} clicks</span>
        {link.clickCap !== null && (
          <span>cap {link.clickCap.toLocaleString()}</span>
        )}
        <span>created {formatDate(link.createdAt)}</span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <CopyButton text={url} />
        <Link href={`/links/${link.id}`}>
          <Button variant="secondary">Details</Button>
        </Link>
        <Link href={`/analytics/${link.id}`}>
          <Button variant="secondary">Analytics</Button>
        </Link>
        <Button variant="danger" loading={deleting} onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
