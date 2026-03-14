import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  const search = String(req.query.search ?? "").trim();

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          enrollments: true,
          submissions: true,
          stepProgresses: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(users);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      submissions: {
        select: {
          id: true,
          stepId: true,
          isCorrect: true,
          score: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      },
      stepProgresses: {
        where: {
          isCompleted: true,
        },
        select: {
          id: true,
          stepId: true,
          completedAt: true,
        },
        orderBy: {
          completedAt: "desc",
        },
        take: 50,
      },
      _count: {
        select: {
          enrollments: true,
          submissions: true,
          stepProgresses: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

export default router;