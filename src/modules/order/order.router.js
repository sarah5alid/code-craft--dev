import Router from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import * as orderController from "./order.controller.js";
const router = Router();

router.post(
  "/createOrder",
  authuntication(Object.values(systemRoles)),
  orderController.createOrder
);

router.post(
  "/convertFromCartToOrder",
  authuntication(Object.values(systemRoles)),
  orderController.convertFromCartToOrder
);

router.get(
  "/payWithStripe/:orderId",
  authuntication(Object.values(systemRoles)),
  orderController.payWithStripe
);
router.post(
  "/webhook",

  orderController.stripeWebhookLocal
);

export default router;
