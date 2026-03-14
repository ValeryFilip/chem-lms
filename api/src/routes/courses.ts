import { Router } from "express";
import { prisma } from "../lib/prisma";
import { hasCourseAccess } from "../lib/access";
import { isAdmin } from "../lib/isAdmin";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.get("/", async (_req, res) => {
  const courses = await prisma.course.findMany({
    include: {
      subject: true,
    },
  });

  res.json(courses);
});

router.get("/:id/progress", async (req, res) => {
  const { id } = req.params;
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              steps: {
                select: { id: true },
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const allowed = await hasCourseAccess(userId, course.id);

  if (!allowed) {
    return res.status(403).json({ error: "Access denied" });
  }

  const allSteps = course.modules.flatMap((module) =>
    module.lessons.flatMap((lesson) => lesson.steps)
  );

  const stepIds = allSteps.map((step) => step.id);

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
  const completedStepIdSet = new Set(completedStepIds);

  const totalSteps = stepIds.length;
  const completedSteps = completedStepIds.length;
  const progressPercent =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  const completedLessonIds = course.modules.flatMap((module) =>
    module.lessons
      .filter((lesson) => {
        if (lesson.steps.length === 0) return false;
        return lesson.steps.every((step) => completedStepIdSet.has(step.id));
      })
      .map((lesson) => lesson.id)
  );

  res.json({
    courseId: id,
    totalSteps,
    completedSteps,
    progressPercent,
    completedLessonIds,
  });
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      subject: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              steps: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const admin = await isAdmin(userId);

  if (!admin && !course.isPublished) {
    return res.status(404).json({ error: "Course not found" });
  }

  const allowed = await hasCourseAccess(userId, course.id);

  if (!allowed) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (!admin) {
    course.modules = course.modules.map((module) => ({
      ...module,
      lessons: module.lessons
        .filter((lesson) => lesson.isPublished)
        .map((lesson) => ({
          ...lesson,
          steps: lesson.steps.filter((step) => step.isPublished),
        })),
    }));
  }

  res.json(course);
});

router.post("/", requireAdmin, async (req, res) => {
  const { title, slug, subjectId } = req.body;

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      subjectId,
    },
  });

  res.json(course);
});

export default router;