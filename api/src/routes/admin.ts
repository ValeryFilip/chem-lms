import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin";
import adminUsersRouter from "./adminUsers";
import adminEnrollmentsRouter from "./adminEnrollments";
import adminCoursesRouter from "./adminCourses";
import adminModulesRouter from "./adminModules";
import adminLessonsRouter from "./adminLessons";
import adminStepsRouter from "./adminSteps";

const router = Router();

router.use(requireAdmin);

router.get("/ping", (_req, res) => {
  res.json({
    ok: true,
    message: "Admin route is available",
    userId: res.locals.userId,
  });
});

router.use("/users", adminUsersRouter);
router.use("/enrollments", adminEnrollmentsRouter);
router.use("/courses", adminCoursesRouter);
router.use("/modules", adminModulesRouter);
router.use("/lessons", adminLessonsRouter);
router.use("/steps", adminStepsRouter);

export default router;