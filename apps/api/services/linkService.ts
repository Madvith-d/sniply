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