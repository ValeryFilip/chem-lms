import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          courseId: true,
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

  res.json(lesson);
});

router.post("/", async (req, res) => {
  const { title, order, moduleId, isPublished } = req.body;

  if (!title || order === undefined || !moduleId) {
    return res.status(400).json({
      error: "title, order and moduleId are required",
    });
  }

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
  });

  if (!module) {
    return res.status(404).json({ error: "Module not found" });
  }

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

router.patch("/:id/steps/reorder", async (req, res) => {
  const { id } = req.params;
  const { stepIds } = req.body as { stepIds?: string[] };

  if (!Array.isArray(stepIds) || stepIds.length === 0) {
    return res.status(400).json({
      error: "stepIds must be a non-empty array",
    });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      steps: {
        select: { id: true },
      },
    },
  });

  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const existingStepIds = lesson.steps.map((step) => step.id);

  const sameLength = existingStepIds.length === stepIds.length;
  const sameIds =
    sameLength &&
    existingStepIds.every((stepId) => stepIds.includes(stepId));

  if (!sameIds) {
    return res.status(400).json({
      error: "stepIds must contain all lesson step ids exactly once",
    });
  }

  await prisma.$transaction(
    stepIds.map((stepId, index) =>
      prisma.step.update({
        where: { id: stepId },
        data: {
          order: index + 1,
        },
      })
    )
  );

  const updatedSteps = await prisma.step.findMany({
    where: { lessonId: id },
    orderBy: { order: "asc" },
  });

  res.json(updatedSteps);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, order, moduleId, isPublished } = req.body;

  const existing = await prisma.lesson.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      order: order ?? existing.order,
      moduleId: moduleId ?? existing.moduleId,
      isPublished:
        isPublished !== undefined
          ? Boolean(isPublished)
          : existing.isPublished,
    },
  });

  res.json(lesson);
});

export default router;