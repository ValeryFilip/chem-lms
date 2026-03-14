import type { Request, Response, NextFunction, RequestHandler } from "express";
import { prisma } from "../lib/prisma";

export const requireAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.cookies.userId;

  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  if (user.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  res.locals.userId = user.id;
  next();
};