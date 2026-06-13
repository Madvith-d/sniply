import { Router } from "express";
import { prisma } from "../lib/prisma";
import { recordClick } from "../services/clickService";
const router = Router();

router.get("/:shortCode", async (req, res) => {
    const { shortCode } = req.params;

    const link = await prisma.link.findUnique({
        where: {
            shortCode,
        },
    });

    if (!link) {
        return res.status(404).json({
            error: "NOT_FOUND",
        });
    }
    const now = new Date();


    console.log("NOW:", now);
    console.log("EXPIRES:", link.expiresAt);
    console.log("COMPARE:", link.expiresAt ? now > link.expiresAt : false);
    if (
        link.startsAt &&
        now < link.startsAt
    ) {
        return res.status(200).json({
            message:
                "Link not active yet",
        });
    }

    if (
        link.expiresAt &&
        now > link.expiresAt
    ) {
        return res.status(410).json({
            message:
                "Link expired",
        });
    }

    if (
        link.clickCap !== null &&
        link.clickCount >= link.clickCap
    ) {
        return res.status(429).json({
            message:
                "Click limit reached",
        });
    }

    const forwarded =
        req.headers["x-forwarded-for"];

    const ip =
        (typeof forwarded === "string"
            ? forwarded.split(",")[0]?.trim()
            : undefined) ||
        req.ip ||
        req.socket.remoteAddress ||
        "unknown";

    await prisma.$transaction(
        async (tx) => {

            await tx.link.update({
                where: {
                    id: link.id,
                },
                data: {
                    clickCount: {
                        increment: 1,
                    },
                },
            });

            await recordClick(
                tx,
                {
                    linkId: link.id,
                    ip,
                    userAgent:
                        req.headers["user-agent"],
                    referer:
                        req.headers.referer,
                }
            );
        }
    );

    return res.redirect(
        307,
        link.originalUrl
    );


});

export default router;