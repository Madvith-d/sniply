import { prisma } from "../lib/prisma";
import { generateShortCode } from "../lib/nanoid";

interface CreateLinkInput {
    originalUrl: string;
    alias?: string;
    startsAt?: string;
    expiresAt?: string;
    clickCap?: number;
}

export async function createLink(
    userId: string,
    data: CreateLinkInput
) {
    const shortCode =
        data.alias || generateShortCode();

    const appUrl = process.env.APP_URL;
    if (appUrl) {
        try {
            const destHost = new URL(data.originalUrl).hostname.toLowerCase();
            const appHost = new URL(appUrl).hostname.toLowerCase();

            if (destHost === appHost) {
                throw new Error(
                    "Destination URL cannot point back to this app — it would create an infinite redirect loop."
                );
            }
        } catch (err) {
            // Re-throw our own error; ignore URL parse errors
            if (
                err instanceof Error &&
                err.message.startsWith("Destination URL cannot")
            ) {
                throw err;
            }
        }
    }
    const existing =
        await prisma.link.findUnique({
            where: {
                shortCode,
            },
        });

    if (existing) {
        throw new Error(
            "Alias already exists"
        );
    }

    return prisma.link.create({
        data: {
            shortCode,
            originalUrl: data.originalUrl,
            startsAt: data.startsAt
                ? new Date(data.startsAt)
                : null,
            expiresAt: data.expiresAt
                ? new Date(data.expiresAt)
                : null,
            clickCap: data.clickCap,
            userId,
        },
    });
}