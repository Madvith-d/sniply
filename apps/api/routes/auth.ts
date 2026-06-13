import { Router } from "express";
import { prisma } from "../lib/prisma";

import { registerUser, loginUser } from "../services/authService";

import { authenticate } from "../middleware/auth";

import { verifyRefreshToken, generateAccessToken } from "../lib/jwt";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await registerUser(email, password);

    res.status(201).json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Registration failed",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const tokens = await loginUser(email, password);

    res.json(tokens);
  } catch (error) {
    res.status(401).json({
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
});

router.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user!.userId,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  res.json(user);
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token required",
    });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
    });

    if (!tokenRecord) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const accessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    res.json({ accessToken });
  } catch {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }
});

export default router;
