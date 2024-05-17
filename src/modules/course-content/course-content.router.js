import { Router } from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { endPointsRoles } from "./course-contenr-endpoints.js";
import * as contentController from "./course-content.controller.js";
import { multerMiddleHost } from "../../middlewares/multer-middleware.js";
import { allowedExtensions } from "../../utils/allowed-extentions.js";

import { checkCourseInstructor } from "../../utils/checkCourseInstructor.js";
const router = Router();

router.post(
  "/uploadCourseVideos/:courseId",
  authuntication(endPointsRoles.UPLOAD_COURSE),
  checkCourseInstructor(),
  multerMiddleHost(allowedExtensions.video).single("video"),
  contentController.uploadVideos
);

router.put(
  "/updateCourseVideos/:courseId/:videoId",
  authuntication(endPointsRoles.UPDATE_COURSE),
  checkCourseInstructor(),
  multerMiddleHost(allowedExtensions.video).single("video"),
  contentController.updateVideos
);

router.delete(
  "/deleteSpceficVideo/:courseId/:videoId",
  authuntication(endPointsRoles.DELETE_COURSE),
  checkCourseInstructor(),

  contentController.deleteSpecificVideo
);

export default router;
