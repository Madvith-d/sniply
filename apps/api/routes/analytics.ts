import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { getSummary }
    from "../services/analyticsService";

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

export default router;