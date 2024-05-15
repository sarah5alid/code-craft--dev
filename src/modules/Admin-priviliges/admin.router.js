import Router from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import * as adminController from "./admin.controller.js";

const router = Router();

router.get(
  "/getAllUsers",
  authuntication(systemRoles.SUPER_ADMIN),
  adminController.getAllUsers
);

router.patch(
  "/approvement/:courseId",
  authuntication(systemRoles.SUPER_ADMIN),
  adminController.approveCourse
);

router.patch(
  "/disApprove/:courseId",
  authuntication(systemRoles.SUPER_ADMIN),
  adminController.disApproveCourse
);

router.put(
  "/pinuser/:userId",
  authuntication(systemRoles.SUPER_ADMIN),
  adminController.pinUser
);
router.put(
  "/unPinUser/:userId",
  authuntication(systemRoles.SUPER_ADMIN),
  adminController.unPinUser
);

export default router;
