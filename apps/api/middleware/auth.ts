import type { NextFunction, Request, Response } from "express";

import {
    verifyAccessToken,
} from "../lib/jwt";

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader =
        req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith(
            "Bearer "
        )
    ) {
        return res
            .status(401)
            .json({
                message:
                    "Missing token",
            });
    }

    try {
        const token = authHeader.split(" ")[1]!;
        const payload = verifyAccessToken(token);

        req.user = payload;

        next();
    } catch {
        return res
            .status(401)
            .json({
                message:
                    "Invalid token",
            });
    }
}