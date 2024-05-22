import { Router } from "express";

import * as couponController from "./coupon.controller.js";
import * as couponSchemas from "./coupon.schemas.js";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { validationMiddleware } from "../../middlewares/validation-middleware.js";
import { endpointsRoles } from "./coupon.endpoints.js";
const router = Router();

router.post(
  "/addCoupon",
  authuntication(endpointsRoles.ADD_COUPOUN),
  validationMiddleware(couponSchemas.addCouponSchema),
  couponController.addCoupon
);

router.get(
  "/applyCoupon",
  authuntication(endpointsRoles.ADD_COUPOUN),

  couponController.validteCouponApi
);

router.get(
  "/getAllCoupons",
  authuntication(endpointsRoles.ADD_COUPOUN),
  couponController.getAllCoupons
);

router.delete(
  "/deleteCoupon/:couponId",
  authuntication(endpointsRoles.ADD_COUPOUN),
  couponController.deleteCoupon 
);

export default router;
