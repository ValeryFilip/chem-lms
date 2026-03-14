import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.use(requireAdmin);

// получить всех пользователей
router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// создать пользователя
router.post("/", async (req, res) => {
  const { email, name } = req.body;

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: "test_hash",
    },
  });

  res.json(user);
});

export default router;