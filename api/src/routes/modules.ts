import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.get("/", async (_req, res) => {
  const modules = await prisma.module.findMany({
    include: {
      course: true,
    },
  });

  res.json(modules);
});

router.post("/", requireAdmin, async (req, res) => {
  const { title, order, courseId } = req.body;

  const module = await prisma.module.create({
    data: {
      title,
      order,
      courseId,
    },
  });

  res.json(module);
});

export default router;