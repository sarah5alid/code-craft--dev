import { Router } from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { endPointsRoles } from "./course.endpoints-roles.js";
import { multerMiddleHost } from "../../middlewares/multer-middleware.js";
import { allowedExtensions } from "../../utils/allowed-extentions.js";
import * as courseController from "./course.controller.js";
import * as courseSchema from "./course.Schemas.js";
import { checkCourseInstructor } from "../../utils/checkCourseInstructor.js";

import { validationMiddleware } from "../../middlewares/validation-middleware.js";
import courseContentRouter  from "../course-content/course-content.router.js";
const router = Router();
router.use("/:courseId/Videos", courseContentRouter);
router.post(
  "/uploadCourseInfo/:categoryId",
  authuntication(endPointsRoles.UPLOAD_COURSE),
  multerMiddleHost(allowedExtensions.image).single("courseImage"),
  validationMiddleware(courseSchema.uploadCourseInfoSchema),
  courseController.uploadCourseInfo
);
router.put(
  "/updatecourseInfo/:courseId",
  authuntication(endPointsRoles.UPDATE_COURSE),
  checkCourseInstructor(),
  multerMiddleHost(allowedExtensions.image).single("courseImage"),
  courseController.updateCourseInfo
);

// router.delete(
//   "/deleteCourse/:courseId",
//   authuntication(endPointsRoles.DELETE_COURSE),

//   courseController.deleteCourse
// );

export default router;
