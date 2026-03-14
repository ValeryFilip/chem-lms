import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const step = await prisma.step.findUnique({
    where: { id },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          moduleId: true,
        },
      },
    },
  });

  if (!step) {
    return res.status(404).json({ error: "Step not found" });
  }

  res.json(step);
});

router.post("/", async (req, res) => {
  const { title, type, order, lessonId, content, isPublished } = req.body;

  if (!title || !type || order === undefined || !lessonId || !content) {
    return res.status(400).json({
      error: "title, type, order, lessonId and content are required",
    });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const step = await prisma.step.create({
    data: {
      title,
      type,
      order,
      lessonId,
      content,
      isPublished: Boolean(isPublished),
    },
  });

  res.json(step);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, type, order, lessonId, content, isPublished } = req.body;

  const existing = await prisma.step.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ error: "Step not found" });
  }

  const step = await prisma.step.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      type: type ?? existing.type,
      order: order ?? existing.order,
      lessonId: lessonId ?? existing.lessonId,
      content: content ?? existing.content,
      isPublished:
        isPublished !== undefined
          ? Boolean(isPublished)
          : existing.isPublished,
    },
  });

  res.json(step);
});

export default router;