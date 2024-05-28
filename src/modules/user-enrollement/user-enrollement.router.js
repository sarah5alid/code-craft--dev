import Router from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";

import * as enrollementController from "./user-enrollement.controller.js";
const router = Router();

router.get(
  "/userCourses",
  authuntication(Object.values(systemRoles)),
  enrollementController.userCourses
);

export default router;
