import { Router } from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { endPointsRoles } from "./course.endpoints-roles.js";
import { multerMiddleHost } from "../../middlewares/multer-middleware.js";
import { allowedExtensions } from "../../utils/allowed-extentions.js";
import * as courseController from "./course.controller.js";
import * as courseSchema from "./course.Schemas.js";

import { validationMiddleware } from "../../middlewares/validation-middleware.js";
const router = Router();

router.post(
  "/uploadCourseInfo",
  authuntication(endPointsRoles.UPLOAD_COURSE),
  multerMiddleHost(allowedExtensions.image).single("course image"),
  validationMiddleware(courseSchema.uploadCourseInfoSchema),
  courseController.uploadCourseInfo
);
router.put(
  "/updatecourseInfo/:courseId",
  authuntication(endPointsRoles.UPDATE_COURSE),
  multerMiddleHost(allowedExtensions.image).single("course image"),
  courseController.updateCourseInfo
);

router.delete(
  "/deleteCourse/:courseId",
  authuntication(endPointsRoles.DELETE_COURSE),

  courseController.deleteCourse
);

export default router;
