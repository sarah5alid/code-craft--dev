import { Router } from "express";

import * as getCCountroller from "./get-courses.controller.js";

import { authuntication } from "../../middlewares/auth-middleware.js";
import { endPointsRoles } from "./get-endpints-roles.js";
import { systemRoles } from "../../utils/system-roles.js";

const router = Router();

router.get(
  "/coursePreview/:courseId",
  authuntication(Object.values(systemRoles)),
  getCCountroller.getCoursePreview
);

router.patch(
  "/updateRecentlyViewed/:courseId",
  authuntication(endPointsRoles.GET_VIEWED),
  getCCountroller.updateRecentlyViewedCourses
);
router.get(
  "/recentlyViewed",
  authuntication(endPointsRoles.GET_VIEWED),

  getCCountroller.getRecentlyViewedCourses
);

router.get("/getAllCourses", getCCountroller.getAllCourses);

export default router;
