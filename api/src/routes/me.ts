import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/stats", async (req, res) => {
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const completedSteps = await prisma.stepProgress.count({
    where: {
      userId,
      isCompleted: true,
    },
  });

  const submissionsCount = await prisma.submission.count({
    where: {
      userId,
    },
  });

  const correctSubmissions = await prisma.submission.count({
    where: {
      userId,
      isCorrect: true,
    },
  });

  const avgScoreResult = await prisma.submission.aggregate({
    where: {
      userId,
    },
    _avg: {
      score: true,
    },
  });

  const averageScore = avgScoreResult._avg.score ?? 0;

  const lessons = await prisma.lesson.findMany({
    include: {
      steps: {
        select: { id: true },
      },
    },
  });

  const completedProgresses = await prisma.stepProgress.findMany({
    where: {
      userId,
      isCompleted: true,
    },
    select: {
      stepId: true,
    },
  });

  const completedStepIdSet = new Set(
    completedProgresses.map((item) => item.stepId)
  );

  const completedLessons = lessons.filter((lesson) => {
    if (lesson.steps.length === 0) return false;

    return lesson.steps.every((step) => completedStepIdSet.has(step.id));
  }).length;

  res.json({
    completedSteps,
    completedLessons,
    submissionsCount,
    correctSubmissions,
    averageScore,
  });
});

export default router;