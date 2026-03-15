import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const moduleItem = await prisma.module.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      lessons: {
        orderBy: { order: "asc" },
        include: {
          steps: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!moduleItem) {
    return res.status(404).json({ error: "Module not found" });
  }

  res.json(moduleItem);
});

router.post("/", async (req, res) => {
  const { title, order, courseId } = req.body;

  if (!title || !courseId) {
    return res.status(400).json({
      error: "title and courseId are required",
    });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  let nextOrder = order;

  if (nextOrder === undefined) {
    const modulesCount = await prisma.module.count({
      where: { courseId },
    });

    nextOrder = modulesCount + 1;
  }

  const moduleItem = await prisma.module.create({
    data: {
      title,
      order: nextOrder,
      courseId,
    },
  });

  res.json(moduleItem);
});

router.patch("/:id/lessons/reorder", async (req, res) => {
  const { id } = req.params;
  const { lessonIds } = req.body as { lessonIds?: string[] };

  if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
    return res.status(400).json({
      error: "lessonIds must be a non-empty array",
    });
  }

  const moduleItem = await prisma.module.findUnique({
    where: { id },
    include: {
      lessons: {
        select: { id: true },
      },
    },
  });

  if (!moduleItem) {
    return res.status(404).json({ error: "Module not found" });
  }

  const existingLessonIds = moduleItem.lessons.map((l) => l.id);

  const sameLength = existingLessonIds.length === lessonIds.length;
  const sameIds =
    sameLength &&
    existingLessonIds.every((lessonId) => lessonIds.includes(lessonId));

  if (!sameIds) {
    return res.status(400).json({
      error: "lessonIds must contain all module lesson ids exactly once",
    });
  }

  await prisma.$transaction(
    lessonIds.map((lessonId, index) =>
      prisma.lesson.update({
        where: { id: lessonId },
        data: {
          order: index + 1,
        },
      })
    )
  );

  const updatedLessons = await prisma.lesson.findMany({
    where: { moduleId: id },
    orderBy: { order: "asc" },
  });

  res.json(updatedLessons);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, order, courseId } = req.body;

  const existing = await prisma.module.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ error: "Module not found" });
  }

  const moduleItem = await prisma.module.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      order: order ?? existing.order,
      courseId: courseId ?? existing.courseId,
    },
  });

  res.json(moduleItem);
});

export default router;