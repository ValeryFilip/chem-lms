import { Router } from "express";
import { prisma } from "../lib/prisma";
import { hasCourseAccess } from "../lib/access";
import { isAdmin } from "../lib/isAdmin";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.get("/", async (_req, res) => {
  const steps = await prisma.step.findMany({
    include: {
      lesson: true,
    },
    orderBy: {
      order: "asc",
    },
  });

  res.json(steps);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const step = await prisma.step.findUnique({
    where: { id },
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

  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const admin = await isAdmin(userId);

  if (!admin) {
    if (!step.isPublished || !step.lesson.isPublished) {
      return res.status(404).json({ error: "Step not found" });
    }
  }

  const allowed = await hasCourseAccess(userId, step.lesson.module.course.id);

  if (!allowed) {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json(step);
});

router.post("/:id/complete", async (req, res) => {
  const { id } = req.params;
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const step = await prisma.step.findUnique({
    where: { id },
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

  if (step.type === "task") {
    return res.status(400).json({
      error: "Task steps must be completed via submissions",
    });
  }

  const progress = await prisma.stepProgress.upsert({
    where: {
      userId_stepId: {
        userId,
        stepId: id,
      },
    },
    update: {
      status: "completed",
      isCompleted: true,
      completedAt: new Date(),
    },
    create: {
      userId,
      stepId: id,
      status: "completed",
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  res.json(progress);
});

router.post("/", requireAdmin, async (req, res) => {
  const { lessonId, title, type, order, content, isPublished } = req.body;

  if (!lessonId || !title || !type || order === undefined || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const step = await prisma.step.create({
    data: {
      lessonId,
      title,
      type,
      order,
      content,
      isPublished: Boolean(isPublished),
    },
  });

  res.json(step);
});

export default router;