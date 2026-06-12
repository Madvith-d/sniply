import { prisma } from "../lib/prisma";

export async function getSummary(
    linkId: string
) {
    const clicks =
        await prisma.click.findMany({
            where: { linkId },
        });

    return {
        total:
            clicks.length,

        unique:
            clicks.filter(
                c => c.isUnique
            ).length,

        bots:
            clicks.filter(
                c => c.isBot
            ).length,

        humans:
            clicks.filter(
                c => !c.isBot
            ).length,
    };
}