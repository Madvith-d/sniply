import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error("[Unhandled error]", err);

    const status =
        (err as { status?: number }).status ??
        (err as { statusCode?: number }).statusCode ??
        500;

    const message =
        err instanceof Error ? err.message : "Internal Server Error";


    res.status(status).json({ message });
};