import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.post("/", requireAdmin, async (req, res) => {
  const { userId, courseId, accessType, status, startsAt, endsAt } = req.body;

  if (!userId || !courseId || !accessType || !status) {
    return res.status(400).json({
      error: "userId, courseId, accessType and status are required",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
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

router.get("/me", async (req, res) => {
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(enrollments);
});

router.get("/me/courses", async (req, res) => {
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const now = new Date();

  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      status: "active",
      OR: [
        { startsAt: null },
        { startsAt: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endsAt: null },
            { endsAt: { gte: now } },
          ],
        },
      ],
    },
    include: {
      course: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const courses = enrollments.map((item) => ({
    enrollmentId: item.id,
    accessType: item.accessType,
    status: item.status,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    course: item.course,
  }));

  res.json(courses);
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const { accessType, status, startsAt, endsAt } = req.body;

  if (!req.params.id) {
    return res.status(400).json({ error: "Enrollment id is required" });
  }

  const id = String(req.params.id);

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { id },
  });

  if (!existingEnrollment) {
    return res.status(404).json({ error: "Enrollment not found" });
  }

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: {
      accessType: accessType ?? existingEnrollment.accessType,
      status: status ?? existingEnrollment.status,
      startsAt:
        startsAt !== undefined
          ? startsAt
            ? new Date(startsAt)
            : null
          : existingEnrollment.startsAt,
      endsAt:
        endsAt !== undefined
          ? endsAt
            ? new Date(endsAt)
            : null
          : existingEnrollment.endsAt,
    },
  });

  res.json(enrollment);
});

export default router;