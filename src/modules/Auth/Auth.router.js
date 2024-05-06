import { Router } from "express";
import * as authController from "./Auth.controller.js";
import { validationMiddleware } from "../../middlewares/validation-middleware.js";
import * as authSchemas from "./Auth.Schema.js";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
const router = Router();

router.post(
  "/signUp",
  validationMiddleware(authSchemas.signUpSchema),
  authController.signUp
);

router.get("/verify-email", authController.verifyEmail);

router.get(
  "/signIn",
  validationMiddleware(authSchemas.signInSchema),
  authController.signIn
);

router.patch(
  "/forgetCode",
  validationMiddleware(authSchemas.forgetCodeSchema),
  authController.forgetCode
);

router.put("/logOut", authuntication(Object.values(systemRoles)), authController.logOut);
router.put("/deleteAccount",authuntication(Object.values(systemRoles)), authController.deleteAccount)
export default router;
