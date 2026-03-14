import { prisma } from "./prisma";

export async function hasCourseAccess(userId: string, courseId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
    },
  });

  if (!user) {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  const now = new Date();

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId,
      status: "active",
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [
        {
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        },
      ],
    },
  });

  return Boolean(enrollment);
}