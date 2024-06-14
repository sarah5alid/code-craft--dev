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

router.get(
  "/getUsersStats",
  authuntication(systemRoles.SUPER_ADMIN),
  adminController.getUsersStats
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
  "/banUser/:userId",
  authuntication(systemRoles.SUPER_ADMIN),
  adminController.banUser
);
router.put(
  "/unBanUser/:userId",
  authuntication(systemRoles.SUPER_ADMIN),
  adminController.unBanUser
);

export default router;
