import { Router } from "express";
import { prisma } from "../lib/prisma";
import { hasCourseAccess } from "../lib/access";

const router = Router();

router.post("/", async (req, res) => {
  const { stepId, answer } = req.body;
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!stepId) {
    return res.status(400).json({ error: "stepId is required" });
  }

  const step = await prisma.step.findUnique({
    where: { id: stepId },
    include: {
      lesson: {
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      },
    },
  });

  if (!step) {
    return res.status(404).json({ error: "Step not found" });
  }

  const allowed = await hasCourseAccess(userId, step.lesson.module.course.id);

  if (!allowed) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (step.type !== "task") {
    return res.status(400).json({
      error: "Submissions are only allowed for task steps",
    });
  }

  const content = step.content as {
    correctAnswer?: string;
    prompt?: string;
    taskType?: string;
  };

  const correctAnswer = content?.correctAnswer;
  const isCorrect = String(answer).trim() === String(correctAnswer).trim();

  const submission = await prisma.submission.create({
    data: {
      stepId,
      userId,
      answerPayload: {
        answer,
      },
      resultPayload: {
        correctAnswer,
      },
      isCorrect,
      score: isCorrect ? 1 : 0,
    },
  });

  if (isCorrect) {
    await prisma.stepProgress.upsert({
      where: {
        userId_stepId: {
          userId,
          stepId,
        },
      },
      update: {
        status: "completed",
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        stepId,
        status: "completed",
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  res.json({
    isCorrect,
    submission,
  });
});

export default router;