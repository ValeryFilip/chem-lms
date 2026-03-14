import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.get("/", async (_req, res) => {
  const subjects = await prisma.subject.findMany();
  res.json(subjects);
});

router.post("/", requireAdmin, async (req, res) => {
  const { slug, title } = req.body;

  const subject = await prisma.subject.create({
    data: {
      slug,
      title,
    },
  });

  res.json(subject);
});

export default router;