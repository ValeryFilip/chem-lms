import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      isPublished: true,
      createdAt: true,
      subject: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      _count: {
        select: {
          modules: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(courses);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const course = await prisma.course.findUnique({
    where: { id },
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

  res.json(course);
});

router.post("/", async (req, res) => {
  const { title, slug, description, subjectId, isPublished } = req.body;

  if (!title || !slug || !subjectId) {
    return res.status(400).json({
      error: "title, slug and subjectId are required",
    });
  }

  const existing = await prisma.course.findUnique({
    where: { slug },
  });

  if (existing) {
    return res.status(409).json({
      error: "Course with this slug already exists",
    });
  }

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      description: description ?? null,
      subjectId,
      isPublished: Boolean(isPublished),
    },
  });

  res.json(course);
});

router.patch("/:id/modules/reorder", async (req, res) => {
  const { id } = req.params;
  const { moduleIds } = req.body as { moduleIds?: string[] };

  if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
    return res.status(400).json({
      error: "moduleIds must be a non-empty array",
    });
  }

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        select: { id: true },
      },
    },
  });

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const existingModuleIds = course.modules.map((m) => m.id);

  const sameLength = existingModuleIds.length === moduleIds.length;
  const sameIds =
    sameLength &&
    existingModuleIds.every((moduleId) =>
      moduleIds.includes(moduleId)
    );

  if (!sameIds) {
    return res.status(400).json({
      error:
        "moduleIds must contain all course module ids exactly once",
    });
  }

  await prisma.$transaction(
    moduleIds.map((moduleId, index) =>
      prisma.module.update({
        where: { id: moduleId },
        data: {
          order: index + 1,
        },
      })
    )
  );

  const updatedModules = await prisma.module.findMany({
    where: { courseId: id },
    orderBy: { order: "asc" },
  });

  res.json(updatedModules);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, slug, description, subjectId, isPublished } = req.body;

  const existing = await prisma.course.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ error: "Course not found" });
  }

  const course = await prisma.course.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      slug: slug ?? existing.slug,
      description:
        description !== undefined
          ? description
          : existing.description,
      subjectId: subjectId ?? existing.subjectId,
      isPublished:
        isPublished !== undefined
          ? Boolean(isPublished)
          : existing.isPublished,
    },
  });

  res.json(course);
});

router.post("/:id/publish", async (req, res) => {
  const { id } = req.params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              steps: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const errors: string[] = [];

  if (course.modules.length === 0) {
    errors.push("Course must have at least one module");
  }

  course.modules.forEach((module, mIndex) => {
    if (module.lessons.length === 0) {
      errors.push(`Module ${mIndex + 1} has no lessons`);
    }

    module.lessons.forEach((lesson, lIndex) => {
      if (lesson.steps.length === 0) {
        errors.push(
          `Lesson ${mIndex + 1}.${lIndex + 1} has no steps`
        );
      }

      lesson.steps.forEach((step, sIndex) => {
        if (!step.content) {
          errors.push(
            `Step ${mIndex + 1}.${lIndex + 1}.${sIndex + 1} has no content`
          );
        }

        if (step.type === "task") {
          const content = step.content as any;

          if (!content.correctAnswer) {
            errors.push(
              `Task step ${mIndex + 1}.${lIndex + 1}.${sIndex + 1} has no correctAnswer`
            );
          }
        }
      });
    });
  });

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Course validation failed",
      details: errors,
    });
  }

  const updated = await prisma.course.update({
    where: { id },
    data: {
      isPublished: true,
    },
  });

  res.json(updated);
});

router.post("/:id/unpublish", async (req, res) => {
  const { id } = req.params;

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const updated = await prisma.course.update({
    where: { id },
    data: {
      isPublished: false,
    },
  });

  res.json(updated);
});

export default router;