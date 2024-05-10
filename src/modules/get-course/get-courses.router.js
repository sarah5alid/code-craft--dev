import { Router } from "express";

import * as getCCountroller from "./get-courses.controller.js";

import {
  getNon_ApprovedCoursesby_Admins,
  approveCourse,
} from "./approve-course.js";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { endPointsRoles } from "./get-endpints-roles.js";

const router = Router();

router.get(
  "/gat-non-approved-admins",
  authuntication(endPointsRoles.APPROVE_COURSE),
  getNon_ApprovedCoursesby_Admins
);

router.patch(
  "/approvement/:courseId",
  authuntication(endPointsRoles.APPROVE_COURSE),
  approveCourse
);

router.get("/getCoursesByUsers", getCCountroller.getAllCoursesByUsers);

router.get("/coursePreview/:courseId", getCCountroller.getCoursePreview);

router.get(
  "/instructorCourses",
  authuntication(endPointsRoles.GET_INS_COURSE),
  getCCountroller.getInstructorCourses
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

export default router;
