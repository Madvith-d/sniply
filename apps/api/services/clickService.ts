import { prisma } from "../lib/prisma";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";
import { isbot } from "isbot";
import crypto from "crypto";

interface ClickInput {
    linkId: string;
    ip: string;
    userAgent?: string;
    referer?: string;
}

export async function recordClick(
    data: ClickInput
) {
    const parser =
        new UAParser(data.userAgent);

    const result =
        parser.getResult();

    const bot =
        isbot(data.userAgent || "");

    const geo =
        geoip.lookup(data.ip);

    const visitorHash =
        crypto
            .createHash("sha256")
            .update(
                `${data.ip}:${data.userAgent}`
            )
            .digest("hex");

    const existing =
        await prisma.click.findFirst({
            where: {
                linkId: data.linkId,
                visitorHash,
            },
        });

    const unique =
        !existing;

    await prisma.click.create({
        data: {
            linkId: data.linkId,

            visitorHash,

            isUnique: unique,
            isBot: !!bot,

            device:
                result.device.type ||
                "desktop",

            browser:
                result.browser.name,

            os:
                result.os.name,

            country:
                geo?.country,

            city:
                geo?.city,

            referer:
                data.referer,
        },
    });
}