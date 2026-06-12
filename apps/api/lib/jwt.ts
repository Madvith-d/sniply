import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET =
    process.env.ACCESS_TOKEN_SECRET!;

const REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET!;

export interface JwtPayload {
    userId: string;
    email: string;
}

export function generateAccessToken(
    payload: JwtPayload
) {
    return jwt.sign(
        payload,
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: "15m",
        }
    );
}

export function generateRefreshToken(
    payload: JwtPayload
) {
    return jwt.sign(
        payload,
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: "30d",
        }
    );
}

export function verifyAccessToken(
    token: string
) {
    return jwt.verify(
        token,
        ACCESS_TOKEN_SECRET
    ) as JwtPayload;
}

export function verifyRefreshToken(
    token: string
) {
    return jwt.verify(
        token,
        REFRESH_TOKEN_SECRET
    ) as JwtPayload;
}