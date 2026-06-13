import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LinkInterstitialPage } from "@/components/pages/LinkInterstitialPage";
import { resolveShortLink } from "@/lib/resolveShortLink";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}): Promise<Metadata> {
  const { shortCode } = await params;
  return { title: `${shortCode} — Sniply` };
}

export default async function ShortLinkPage({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;
  const result = await resolveShortLink(shortCode);

  if (result.status === "redirect") {
    redirect(result.url);
  }

  return <LinkInterstitialPage state={result.status} shortCode={shortCode} />;
}
