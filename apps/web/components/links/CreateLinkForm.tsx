"use client";

import { useState } from "react";
import { linksApi } from "@/lib/api";
import type { CreateLinkInput, Link } from "@/lib/types";
import { fromDatetimeLocalValue } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface CreateLinkFormProps {
  onCreated: (link: Link) => void;
}

export function CreateLinkForm({ onCreated }: CreateLinkFormProps) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [clickCap, setClickCap] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const input: CreateLinkInput = { originalUrl };
      if (alias.trim()) input.alias = alias.trim();
      const startIso = fromDatetimeLocalValue(startsAt);
      if (startIso) input.startsAt = startIso;
      const expireIso = fromDatetimeLocalValue(expiresAt);
      if (expireIso) input.expiresAt = expireIso;
      if (clickCap) input.clickCap = parseInt(clickCap, 10);

      const link = await linksApi.create(input);
      onCreated(link);
      setOriginalUrl("");
      setAlias("");
      setStartsAt("");
      setExpiresAt("");
      setClickCap("");
      setShowAdvanced(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Shorten a link">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Destination URL"
          type="url"
          placeholder="https://example.com/very-long-page"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
        />

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-bold font-heading text-left hover:underline w-fit"
        >
          {showAdvanced ? "− Hide options" : "+ More options"}
        </button>

        {showAdvanced && (
          <div className="flex flex-col gap-4 p-4 brutal-card-sm bg-paper">
            <Input
              label="Custom alias"
              placeholder="my-link"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Starts at"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
              <Input
                label="Expires at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <Input
              label="Click cap"
              type="number"
              min={1}
              placeholder="1000"
              value={clickCap}
              onChange={(e) => setClickCap(e.target.value)}
            />
          </div>
        )}

        {error && (
          <p className="text-sm font-medium text-red bg-red/20 border-[2px] border-red rounded-[10px] px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full sm:w-auto">
          Create short link
        </Button>
      </form>
    </Card>
  );
}
