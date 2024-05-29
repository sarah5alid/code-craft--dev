import Router from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";

import * as enrollementController from "./user-enrollement.controller.js";
const router = Router({ mergeParams: true });

router.get(
  "/userCourses",
  authuntication(Object.values(systemRoles)),
  enrollementController.userCourses
);

router.put(
  "/:courseId/:videoId/updateProgress",
  authuntication(Object.values(systemRoles)),
  enrollementController.markVideoCompleted
);

export default router;
