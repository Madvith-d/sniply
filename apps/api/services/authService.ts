import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../lib/jwt";

export async function registerUser(
    email: string,
    password: string
) {
    const existingUser =
        await prisma.user.findUnique({
            where: { email },
        });

    if (existingUser) {
        throw new Error(
            "User already exists"
        );
    }

    const passwordHash =
        await bcrypt.hash(password, 12);

    const user =
        await prisma.user.create({
            data: {
                email,
                passwordHash,
            },
        });

    return user;
}

export async function loginUser(
    email: string,
    password: string
) {
    const user =
        await prisma.user.findUnique({
            where: { email },
        });

    if (!user) {
        throw new Error(
            "Invalid credentials"
        );
    }

    const validPassword =
        await bcrypt.compare(
            password,
            user.passwordHash
        );

    if (!validPassword) {
        throw new Error(
            "Invalid credentials"
        );
    }

    const payload = {
        userId: user.id,
        email: user.email,
    };

    const accessToken =
        generateAccessToken(payload);

    const refreshToken =
        generateRefreshToken(payload);

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(
                Date.now() +
                30 * 24 * 60 * 60 * 1000
            ),
        },
    });

    return {
        accessToken,
        refreshToken,
    };
}