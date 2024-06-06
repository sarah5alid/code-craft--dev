import { Router } from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import { multerMiddleHost } from "../../middlewares/multer-middleware.js";
import * as contactController from "./contact-us.controller.js";
import { allowedExtensions } from "../../utils/allowed-extentions.js";
const router = Router();

router.post(
  "/contact-us",
  authuntication(Object.values(systemRoles)),
  multerMiddleHost(allowedExtensions.image).single("file"),
  contactController.contactUs
);
export default router;
