import Router from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import * as cartController from "./cart.controller.js";
const router = Router();

router.post(
  "/addToCart",
  authuntication(Object.values(systemRoles)),
  cartController.addToCart
);

router.put(
  "/removeFromCart/:courseId",
  authuntication(Object.values(systemRoles)),
  cartController.removeFromcart
);

export default router;
