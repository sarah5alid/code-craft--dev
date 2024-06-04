import Router from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import { validationMiddleware } from "../../middlewares/validation-middleware.js";

import * as reviewSchema from "./review.Schema.js";
import * as reviewController from "./review.controller.js";
const router = Router();

router.post(
  "/addReview/:courseId",
  authuntication(Object.values(systemRoles)),
  validationMiddleware(reviewSchema.addReview),
  reviewController.addReview
);

router.put(
  "/removeRate/:reviewId",
  authuntication(Object.values(systemRoles)),
  reviewController.removeRating
);
router.put(
  "/removeComment/:reviewId",
  authuntication(Object.values(systemRoles)),
  reviewController.removeComment
);

router.get(
  "/courseReview",
  authuntication(Object.values(systemRoles)),
  reviewController.courseReviews
);
export default router;
