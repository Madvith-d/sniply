import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { getSummary, getBreakdown, getTimeSeries } from "../services/analyticsService";

const router = Router();

router.get(
    "/:id",
    authenticate,
    async (req, res) => {
        const link =
            await prisma.link.findFirst({
                where: {
                    id:
                        req.params.id as any,
                    userId:
                        req.user!.userId,
                },
            });

        if (!link) {
            return res
                .status(404)
                .json({
                    message:
                        "Link not found",
                });
        }

        const summary =
            await getSummary(
                link.id
            );

        res.json(summary);
    }
);
router.get(
    "/:id/timeseries",
    authenticate,
    async (req, res) => {

        const granularity =
            req.query.granularity;

        if (
            granularity !== undefined &&
            granularity !== "hour" &&
            granularity !== "day" &&
            granularity !== "week"
        ) {
            return res.status(400).json({
                message:
                    "granularity must be hour, day, or week",
            });
        }

        const last =
            req.query.last
                ? Number(req.query.last)
                : undefined;

        if (
            last !== undefined &&
            (
                Number.isNaN(last) ||
                last <= 0
            )
        ) {
            return res.status(400).json({
                message:
                    "last must be a positive number",
            });
        }

        const data =
            await getTimeSeries(
                req.params.id! as any,
                granularity as
                | "hour"
                | "day"
                | "week"
                | undefined,
                last
            );

        res.json(data);
    }
);

router.get(
    "/:id/breakdown",
    authenticate,
    async (req, res) => {
        const by =
            req.query.by;

        if (
            by !== "device" &&
            by !== "browser" &&
            by !== "os" &&
            by !== "country" &&
            by !== "city"
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Invalid breakdown field",
                });
        }

        const data =
            await getBreakdown(
                req.params.id! as any,
                by
            );

        res.json(data);
    }
);
export default router;