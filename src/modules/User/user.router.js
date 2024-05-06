import { Router } from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { multerMiddleHost } from "../../middlewares/multer-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import { allowedExtensions } from "../../utils/allowed-extentions.js";
import { validationMiddleware } from "../../middlewares/validation-middleware.js";

import * as userController from "./user.controller.js";
import * as userSchemas from "./user.Schemas.js";
const router = Router();

router.post(
  "/uploadProfilePic",
  authuntication(Object.values(systemRoles)),
  multerMiddleHost(allowedExtensions.image).single("profile"),

  userController.uploadProfile_Pic
);

router.patch(
  "/update_profile_pic",
  authuntication(Object.values(systemRoles)),
  multerMiddleHost(allowedExtensions.image).single("profile"),
  userController.updateProfile_Pic
);
router.patch(
  "/remove_profile_pic",
  authuntication(Object.values(systemRoles)),
  userController.deleteProfile_Pic
);

router.patch(
  "/updatePassword",
  authuntication(Object.values(systemRoles)),
  validationMiddleware(userSchemas.updatePasswordSchema),
  userController.updatePassword
);

router.put(
  "/update_profile_date",
  authuntication(Object.values(systemRoles)),
  validationMiddleware(userSchemas.updateProfileSchema),
  userController.updateProfileData
);

router.get(
  "/get_user_profile",
  authuntication(Object.values(systemRoles)),

  userController.getProfile
);
export default router;
