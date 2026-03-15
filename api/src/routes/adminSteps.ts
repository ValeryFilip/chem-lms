import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
  const { lessonId, title, type, order, content } = req.body;

  if (!lessonId || !title || !type) {
    return res.status(400).json({
      error: "lessonId, title and type are required",
    });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  let nextOrder = order;

  if (nextOrder === undefined) {
    const stepsCount = await prisma.step.count({
      where: { lessonId },
    });

    nextOrder = stepsCount + 1;
  }

  let defaultContent: any = content;

  if (!defaultContent) {
    if (type === "video") {
      defaultContent = { videoUrl: "" };
    }

    if (type === "text") {
      defaultContent = { html: "" };
    }

    if (type === "task") {
      defaultContent = {
        prompt: "",
        taskType: "text",
        correctAnswer: "",
      };
    }
  }

  const step = await prisma.step.create({
    data: {
      lessonId,
      title,
      type,
      order: nextOrder,
      content: defaultContent,
      isPublished: false,
    },
  });

  res.json(step);
});

export default router;