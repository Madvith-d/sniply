import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LinkInterstitialPage } from "@/components/pages/LinkInterstitialPage";
import { resolveShortLink } from "@/lib/resolveShortLink";
import { BRAND_NAME } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}): Promise<Metadata> {
  const { shortCode } = await params;
  return { title: `${shortCode} — ${BRAND_NAME}` };
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
