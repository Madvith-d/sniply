import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createLink } from "../services/linkService";
import { prisma } from "../lib/prisma";

const router = Router();

router.post(
    "/",
    authenticate,
    async (req, res) => {
        try {
            const link =
                await createLink(
                    req.user!.userId,
                    req.body
                );

            res.status(201).json(link);
        } catch (error) {
            res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to create link",
            });
        }
    }
);

router.get(
    "/",
    authenticate,
    async (req, res) => {
        const links =
            await prisma.link.findMany({
                where: {
                    userId:
                        req.user!.userId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

        res.json(links);
    }
);

router.delete(
    "/:id",
    authenticate,
    async (req, res) => {
        const link =
            await prisma.link.findFirst({
                where: {
                    id: req.params.id as any,
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

        await prisma.link.delete({
            where: {
                id: link.id,
            },
        });

        res.status(204).send();
    }
);


router.get(
    "/:id",
    authenticate,
    async (req, res) => {
        const link =
            await prisma.link.findFirst({
                where: {
                    id: req.params.id as any,
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

        res.json(link);
    }
);
export default router;