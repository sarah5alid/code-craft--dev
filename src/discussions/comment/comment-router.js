import Router from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import { multerMiddleHost } from "../../middlewares/multer-middleware.js";
import { allowedExtensions } from "../../utils/allowed-extentions.js";
import * as commentcontroller from "./comment-controller.js";
const router = Router({ mergeParams: true });

router.post(
  "/:postId/addComment",
  authuntication(Object.values(systemRoles)),
  multerMiddleHost(allowedExtensions.image).single("image"),
  commentcontroller.addComment
);

router.put(
  "/updateComment/:commentId",
  authuntication(Object.values(systemRoles)),
  multerMiddleHost(allowedExtensions.image).single("image"),
  commentcontroller.updateComment
);

router.get("/all", commentcontroller.postComments);
router.delete(
  "/:commentId",
  authuntication(Object.values(systemRoles)),
  commentcontroller.deleteComment
);

export default router;
