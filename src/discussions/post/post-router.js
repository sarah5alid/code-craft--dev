import Router from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import { multerMiddleHost } from "../../middlewares/multer-middleware.js";
import { allowedExtensions } from "../../utils/allowed-extentions.js";
import * as postController from "./post-controller.js";

const router = Router();
router.post(
  "/addPost",
  authuntication(Object.values(systemRoles)),
  multerMiddleHost(allowedExtensions.image).array("images"),
  postController.addPost
);

router.put(
  "/updatePost/:postId",
  authuntication(Object.values(systemRoles)),
  multerMiddleHost(allowedExtensions.image).array("images"),
  postController.updatePost
);

router.get("/", postController.viewPosts);

router.get(
  "/:postId",
  authuntication(Object.values(systemRoles)),
  postController.singlePost
);

router.delete(
  "/deletePost/:postId",
  authuntication(Object.values(systemRoles)),
  postController.deletePost
);
import commentRouter from "../comment/comment-router.js";

router.use("/:postId/comments", commentRouter);

export default router;
