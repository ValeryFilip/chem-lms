import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  const status = req.query.status as string | undefined;
  const userId = req.query.userId as string | undefined;
  const courseId = req.query.courseId as string | undefined;

  const enrollments = await prisma.enrollment.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(userId ? { userId } : {}),
      ...(courseId ? { courseId } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
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
  });

  res.json(enrollments);
});

router.post("/", async (req, res) => {
  const { userId, courseId, accessType, status, startsAt, endsAt } = req.body;

  if (!userId || !courseId || !accessType || !status) {
    return res.status(400).json({
      error: "userId, courseId, accessType and status are required",
    });
  }

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    update: {
      accessType,
      status,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
    create: {
      userId,
      courseId,
      accessType,
      status,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
  });

  res.json(enrollment);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { accessType, status, startsAt, endsAt } = req.body;

  const existing = await prisma.enrollment.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ error: "Enrollment not found" });
  }

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: {
      accessType: accessType ?? existing.accessType,
      status: status ?? existing.status,
      startsAt:
        startsAt !== undefined
          ? startsAt
            ? new Date(startsAt)
            : null
          : existing.startsAt,
      endsAt:
        endsAt !== undefined
          ? endsAt
            ? new Date(endsAt)
            : null
          : existing.endsAt,
    },
  });

  res.json(enrollment);
});

export default router;