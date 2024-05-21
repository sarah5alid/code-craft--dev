


import Router from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import * as orderController from './order.controller.js'
const router = Router();

router.post(
  "/createOrder",
  authuntication(Object.values(systemRoles)),
  orderController.createOrder
);

// router.put(
//   "/removeFromCart/:courseId",
//   authuntication(Object.values(systemRoles)),
//   cartController.removeFromcart
// );

export default router;
