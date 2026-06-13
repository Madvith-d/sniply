import { prisma } from "../lib/prisma";
import { UAParser } from "ua-parser-js";
import { lookupGeo } from "./geoService";
import { isbot } from "isbot";
import crypto from "crypto";
import type { PrismaClient, Prisma } from "../generated/prisma/client";

interface ClickInput {
  linkId: string;
  ip: string;
  userAgent?: string;
  referer?: string;
}

export async function recordClick(
  tx: Prisma.TransactionClient | PrismaClient,
  data: ClickInput,
) {
  const parser = new UAParser(data.userAgent);

  const result = parser.getResult();

  const bot = isbot(data.userAgent || "");

  const geo = await lookupGeo(data.ip);

  const visitorHash = crypto
    .createHash("sha256")
    .update(`${data.ip}:${data.userAgent}`)
    .digest("hex");

  const existing = await tx.click.findFirst({
    where: {
      linkId: data.linkId,
      visitorHash,
    },
  });

  const unique = !existing;

  await tx.click.create({
    data: {
      linkId: data.linkId,

      visitorHash,

      isUnique: unique,
      isBot: !!bot,

      device: result.device.type || "desktop",

      browser: result.browser.name,

      os: result.os.name,

      country: geo.country,

      city: geo.city,

      referer: data.referer,
    },
  });
}
