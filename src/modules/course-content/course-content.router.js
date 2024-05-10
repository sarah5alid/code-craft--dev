import { Router } from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { endPointsRoles } from "./course-contenr-endpoints.js";
import * as contentController from "./course-content.controller.js";
import { multerMiddleHost } from "../../middlewares/multer-middleware.js";
import { allowedExtensions } from "../../utils/allowed-extentions.js";
const router = Router();

router.post(
  "/uploadCourseVideos/:courseId",
  authuntication(endPointsRoles.UPLOAD_COURSE),
  multerMiddleHost(allowedExtensions.video).single("video"),
  contentController.uploadVideos
);

router.put(
  "/updateCourseVideos/:courseId/:videoId",
  authuntication(endPointsRoles.UPDATE_COURSE),
  multerMiddleHost(allowedExtensions.video).single(
    "video",
   
  ), contentController.updateVideos
);

router.delete(
  "/deleteSpceficVideo/:courseId/:videoId",
  authuntication(endPointsRoles.DELETE_COURSE),

  contentController.deleteSpecificVideo
);

export default router;
