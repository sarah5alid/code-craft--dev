import { Router } from "express";
import { authuntication } from "../../middlewares/auth-middleware.js";
import { endPointsRoles } from "./category.endpoints.js";
import * as categoryController from "./category.controller.js";
import * as categorySchema from "./category.Schemas.js";
import { validationMiddleware } from "../../middlewares/validation-middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
const router = Router();
router.post(
  "/addCategory",
  authuntication(endPointsRoles.ADD_CATEGORY),

  validationMiddleware(categorySchema.addCategorySchema),
  categoryController.addCategory
);
//update
router.put(
  "/updateCategory/:categoryId",
  authuntication(endPointsRoles.UPDATE_CATEGORY),

  validationMiddleware(categorySchema.updateCategorySchema),
  categoryController.updateCategory
);

router.get(
  "/getAllCategories",
  authuntication(Object.values(systemRoles)),
  categoryController.getALlCategories
);

export default router;
