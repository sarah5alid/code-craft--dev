import { Router } from "express";
import * as likesController from "./like-controller.js";

import { authuntication } from "../../middlewares/auth-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
const router = Router();

router.get(
  "/",
  authuntication(Object.values(systemRoles)),
  likesController.getUserLikesHistory
);

router.post(
  "/:likeDoneOnId",
  authuntication(Object.values(systemRoles)),
  likesController.likeOrUnlike
);

export default router;
