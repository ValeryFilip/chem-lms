import { Router } from "express";
import { prisma } from "../lib/prisma";
import { hasCourseAccess } from "../lib/access";
import { isAdmin } from "../lib/isAdmin";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.get("/", async (_req, res) => {
  const lessons = await prisma.lesson.findMany({
    include: {
      module: true,
      steps: {
        orderBy: { order: "asc" },
      },
    },
  });

  res.json(lessons);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        include: {
          course: true,
        },
      },
      steps: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const admin = await isAdmin(userId);

  if (!admin && !lesson.isPublished) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const allowed = await hasCourseAccess(userId, lesson.module.course.id);

  if (!allowed) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (!admin) {
    lesson.steps = lesson.steps.filter((step) => step.isPublished);
  }

  res.json(lesson);
});

router.get("/:id/progress", async (req, res) => {
  const { id } = req.params;
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        include: {
          course: true,
        },
      },
      steps: {
        orderBy: { order: "asc" },
        select: { id: true },
      },
    },
  });

  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const allowed = await hasCourseAccess(userId, lesson.module.course.id);

  if (!allowed) {
    return res.status(403).json({ error: "Access denied" });
  }

  const stepIds = lesson.steps.map((step) => step.id);

  const progresses = await prisma.stepProgress.findMany({
    where: {
      userId,
      stepId: {
        in: stepIds,
      },
      isCompleted: true,
    },
    select: {
      stepId: true,
    },
  });

  const completedStepIds = progresses.map((item) => item.stepId);

  const totalSteps = stepIds.length;
  const completedSteps = completedStepIds.length;
  const progressPercent =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  res.json({
    lessonId: id,
    totalSteps,
    completedSteps,
    progressPercent,
    completedStepIds,
  });
});

router.get("/:id/steps", async (req, res) => {
  const { id } = req.params;
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const allowed = await hasCourseAccess(userId, lesson.module.course.id);

  if (!allowed) {
    return res.status(403).json({ error: "Access denied" });
  }

  const admin = await isAdmin(userId);

  if (!admin && !lesson.isPublished) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const steps = await prisma.step.findMany({
    where: {
      lessonId: id,
      ...(admin ? {} : { isPublished: true }),
    },
    orderBy: { order: "asc" },
  });

  res.json(steps);
});

router.post("/", requireAdmin, async (req, res) => {
  const { title, order, moduleId, isPublished } = req.body;

  const lesson = await prisma.lesson.create({
    data: {
      title,
      order,
      moduleId,
      isPublished: Boolean(isPublished),
    },
  });

  res.json(lesson);
});

export default router;